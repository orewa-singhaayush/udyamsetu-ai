import os
import re
import json
import uuid
import shutil
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.supervisor import process_business
from app import rag
from app.database import get_db, init_db, UPLOADS_DIR, BASE_DIR

# --------------------------------
# FASTAPI APP & CORS
# --------------------------------

app = FastAPI(
    title="UdyamSetu AI",
    description="AI-powered business approval and regulatory guidance system",
    version="1.0.0"
)

# Initialize database schema on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "*"  # Allow flexible local dev access while preserving origin headers
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------
# REQUEST / RESPONSE MODELS
# --------------------------------

class BusinessRequest(BaseModel):
    business_description: str

class CreateProjectRequest(BaseModel):
    user_id: Optional[str] = "user-default-1"
    name: str
    description: Optional[str] = ""
    analysis_result: Optional[Dict[str, Any]] = None

class UpdateProjectRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class UpdateApprovalStatusRequest(BaseModel):
    status: str # 'identified', 'in_progress', 'completed', 'not_applicable', 'review_required'

class AskAIRequest(BaseModel):
    project_id: Optional[str] = None
    question: str


# --------------------------------
# ROOT & HEALTH
# --------------------------------

@app.get("/")
def root():
    return {
        "message": "UdyamSetu AI API is running",
        "status": "healthy"
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "UdyamSetu AI",
        "model": rag.MODEL_NAME,
        "domains": list(rag.DOMAIN_PATHS.keys())
    }


# --------------------------------
# CORE AI ANALYSIS (PRESERVED)
# --------------------------------

@app.post("/api/analyze-business")
def analyze_business(request: BusinessRequest):
    if not request.business_description or not request.business_description.strip():
        raise HTTPException(status_code=400, detail="Business description cannot be empty.")
    
    result = process_business(
        request.business_description
    )
    return result


# --------------------------------
# PROJECTS API
# --------------------------------

@app.get("/api/projects")
def list_projects(user_id: str = "user-default-1"):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT p.id, p.user_id, p.name, p.description, p.status, p.created_at, p.updated_at,
           bp.business_type, bp.business_subtype, bp.industry, bp.location, bp.budget, bp.scale
    FROM projects p
    LEFT JOIN business_profiles bp ON bp.project_id = p.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
    """, (user_id,))
    rows = cursor.fetchall()
    
    projects = []
    for r in rows:
        p_id = r["id"]
        # Count approvals
        cursor.execute("SELECT COUNT(*) FROM project_approvals WHERE project_id = ?", (p_id,))
        total_approvals = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM project_approvals WHERE project_id = ? AND status = 'completed'", (p_id,))
        completed_approvals = cursor.fetchone()[0]
        
        # Count documents
        cursor.execute("SELECT COUNT(*) FROM project_documents WHERE project_id = ?", (p_id,))
        total_docs = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM project_documents WHERE project_id = ? AND status = 'uploaded'", (p_id,))
        uploaded_docs = cursor.fetchone()[0]

        projects.append({
            "id": r["id"],
            "user_id": r["user_id"],
            "name": r["name"],
            "description": r["description"],
            "status": r["status"],
            "created_at": r["created_at"],
            "updated_at": r["updated_at"],
            "business_type": r["business_type"],
            "business_subtype": r["business_subtype"],
            "industry": r["industry"],
            "location": r["location"],
            "budget": r["budget"],
            "scale": r["scale"],
            "stats": {
                "total_approvals": total_approvals,
                "completed_approvals": completed_approvals,
                "total_documents": total_docs,
                "uploaded_documents": uploaded_docs,
                "document_progress_pct": int((uploaded_docs / total_docs * 100) if total_docs > 0 else 0)
            }
        })
    conn.close()
    return {"projects": projects}


@app.post("/api/projects")
def create_project(request: CreateProjectRequest):
    project_id = f"proj-{uuid.uuid4().hex[:8]}"
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Ensure user exists
        cursor.execute("SELECT id FROM users WHERE id = ?", (request.user_id,))
        if not cursor.fetchone():
            cursor.execute("INSERT INTO users (id, email, full_name) VALUES (?, ?, ?)",
                           (request.user_id, f"{request.user_id}@udyamsetu.ai", "Entrepreneur"))

        # Insert project
        cursor.execute("""
        INSERT INTO projects (id, user_id, name, description, status)
        VALUES (?, ?, ?, ?, 'active')
        """, (project_id, request.user_id, request.name, request.description))

        analysis = request.analysis_result
        if analysis:
            profile = analysis.get("business_profile", {})
            # Insert business profile
            bp_id = f"bp-{uuid.uuid4().hex[:8]}"
            cursor.execute("""
            INSERT INTO business_profiles (id, project_id, business_type, business_subtype, industry, location, budget, scale, activities, missing_information)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                bp_id,
                project_id,
                profile.get("business_type"),
                profile.get("business_subtype"),
                profile.get("industry"),
                profile.get("location"),
                profile.get("budget"),
                profile.get("scale"),
                json.dumps(profile.get("activities", [])),
                json.dumps(profile.get("missing_information", []))
            ))

            # Insert project approvals
            approvals = analysis.get("approvals", [])
            for app_data in approvals:
                pa_id = f"pa-{uuid.uuid4().hex[:8]}"
                app_name = app_data.get("approval_name")
                cursor.execute("""
                INSERT INTO project_approvals (
                    id, project_id, approval_name, authority, status, applicability,
                    ai_reason, rag_domain, rag_query, rag_answer, sources
                ) VALUES (?, ?, ?, ?, 'identified', ?, ?, ?, ?, ?, ?)
                """, (
                    pa_id,
                    project_id,
                    app_name,
                    app_data.get("authority"),
                    app_data.get("applicability", "potentially_applicable"),
                    app_data.get("rag_query"),
                    app_data.get("rag_domain"),
                    app_data.get("rag_query"),
                    app_data.get("rag_answer"),
                    json.dumps(app_data.get("sources", []))
                ))

                # Populate project_documents from required_documents master for this approval
                cursor.execute("""
                SELECT id, document_name, document_type FROM required_documents WHERE approval_name = ?
                """, (app_name,))
                req_docs = cursor.fetchall()

                for rd in req_docs:
                    pd_id = f"pdoc-{uuid.uuid4().hex[:8]}"
                    cursor.execute("""
                    INSERT INTO project_documents (
                        id, project_id, required_document_id, user_id, document_name,
                        document_type, approval_name, status, verification_status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'missing', 'pending')
                    """, (
                        pd_id,
                        project_id,
                        rd["id"],
                        request.user_id,
                        rd["document_name"],
                        rd["document_type"],
                        app_name
                    ))

        conn.commit()
        conn.close()
        return {"id": project_id, "name": request.name, "status": "created"}

    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")


@app.get("/api/projects/{project_id}")
def get_project(project_id: str):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    proj = cursor.fetchone()
    if not proj:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found.")

    cursor.execute("SELECT * FROM business_profiles WHERE project_id = ?", (project_id,))
    bp = cursor.fetchone()
    business_profile = dict(bp) if bp else {}
    if business_profile:
        business_profile["activities"] = json.loads(business_profile.get("activities") or "[]")
        business_profile["missing_information"] = json.loads(business_profile.get("missing_information") or "[]")

    cursor.execute("SELECT * FROM project_approvals WHERE project_id = ? ORDER BY created_at ASC", (project_id,))
    approvals_rows = cursor.fetchall()
    approvals = []
    for a in approvals_rows:
        ad = dict(a)
        ad["sources"] = json.loads(ad.get("sources") or "[]")
        approvals.append(ad)

    cursor.execute("SELECT * FROM project_documents WHERE project_id = ? ORDER BY approval_name ASC", (project_id,))
    doc_rows = cursor.fetchall()
    documents = [dict(d) for d in doc_rows]

    # Stats
    total_docs = len(documents)
    uploaded_docs = sum(1 for d in documents if d["status"] == "uploaded")
    total_approvals = len(approvals)
    completed_approvals = sum(1 for a in approvals if a["status"] == "completed")

    conn.close()

    return {
        "project": dict(proj),
        "business_profile": business_profile,
        "approvals": approvals,
        "documents": documents,
        "stats": {
            "total_approvals": total_approvals,
            "completed_approvals": completed_approvals,
            "total_documents": total_docs,
            "uploaded_documents": uploaded_docs,
            "document_progress_pct": int((uploaded_docs / total_docs * 100) if total_docs > 0 else 0)
        }
    }


@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found.")
    
    # Delete uploaded directory if exists
    proj_upload_dir = UPLOADS_DIR / project_id
    if proj_upload_dir.exists():
        shutil.rmtree(proj_upload_dir, ignore_errors=True)

    cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    conn.commit()
    conn.close()
    return {"message": "Project deleted successfully."}


# --------------------------------
# APPROVALS API
# --------------------------------

@app.get("/api/projects/{project_id}/approvals")
def get_project_approvals(project_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM project_approvals WHERE project_id = ? ORDER BY created_at ASC", (project_id,))
    rows = cursor.fetchall()
    conn.close()

    approvals = []
    for r in rows:
        d = dict(r)
        d["sources"] = json.loads(d.get("sources") or "[]")
        approvals.append(d)
    return {"approvals": approvals}


@app.patch("/api/projects/{project_id}/approvals/{approval_id}")
def update_approval_status(project_id: str, approval_id: str, req: UpdateApprovalStatusRequest):
    allowed = ["identified", "in_progress", "completed", "not_applicable", "review_required"]
    if req.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {allowed}")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE project_approvals
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND project_id = ?
    """, (req.status, approval_id, project_id))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Approval record not found.")
    conn.commit()
    conn.close()
    return {"id": approval_id, "status": req.status}


# --------------------------------
# DOCUMENTS API & UPLOAD
# --------------------------------

@app.get("/api/projects/{project_id}/documents")
def get_project_documents(project_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT pd.*, rd.description as requirement_description, rd.is_required, rd.source_url as requirement_source_url
    FROM project_documents pd
    LEFT JOIN required_documents rd ON rd.id = pd.required_document_id
    WHERE pd.project_id = ?
    ORDER BY pd.approval_name, pd.document_name
    """, (project_id,))
    rows = cursor.fetchall()
    conn.close()

    docs = [dict(r) for r in rows]
    total = len(docs)
    uploaded = sum(1 for d in docs if d["status"] == "uploaded")
    missing = sum(1 for d in docs if d["status"] == "missing")
    needs_review = sum(1 for d in docs if d["status"] == "needs_review")

    return {
        "documents": docs,
        "stats": {
            "total": total,
            "uploaded": uploaded,
            "missing": missing,
            "needs_review": needs_review,
            "progress_pct": int((uploaded / total * 100) if total > 0 else 0)
        }
    }


@app.post("/api/projects/{project_id}/documents/upload")
async def upload_document(
    project_id: str,
    document_id: str = Form(...),
    file: UploadFile = File(...)
):
    # Validate file format
    allowed_extensions = {".pdf", ".jpg", ".jpeg", ".png"}
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}'. Only PDF, JPG, and PNG files are accepted."
        )

    # Validate file size (max 10MB)
    MAX_SIZE = 10 * 1024 * 1024
    content = await file.read()
    file_size = len(content)
    if file_size > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds maximum allowed size of 10MB.")

    # Save to disk
    proj_dir = UPLOADS_DIR / project_id
    proj_dir.mkdir(parents=True, exist_ok=True)
    safe_filename = f"{uuid.uuid4().hex[:8]}_{re.sub(r'[^a-zA-Z0-9_.-]', '_', file.filename)}"
    dest_path = proj_dir / safe_filename
    with open(dest_path, "wb") as f:
        f.write(content)

    file_url = f"/api/projects/{project_id}/documents/{document_id}/file"

    # Update database
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE project_documents
    SET file_url = ?,
        file_name = ?,
        file_size = ?,
        mime_type = ?,
        status = 'uploaded',
        verification_status = 'pending',
        uploaded_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND project_id = ?
    """, (file_url, file.filename, file_size, file.content_type, document_id, project_id))

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Document checklist item not found.")

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "document_id": document_id,
        "file_name": file.filename,
        "file_size": file_size,
        "file_url": file_url
    }


@app.get("/api/projects/{project_id}/documents/{document_id}/file")
def download_document(project_id: str, document_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT file_name, mime_type FROM project_documents WHERE id = ? AND project_id = ? AND status = 'uploaded'
    """, (document_id, project_id))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Uploaded file not found.")

    proj_dir = UPLOADS_DIR / project_id
    for f in proj_dir.glob("*"):
        if f.is_file():
            return FileResponse(path=str(f), filename=row["file_name"], media_type=row["mime_type"])

    raise HTTPException(status_code=404, detail="File not found on disk.")


# --------------------------------
# CONTEXTUAL AI ASSISTANT API
# --------------------------------

@app.post("/api/ai/ask")
def ask_assistant(request: AskAIRequest):
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # Determine domain context
    domain = None
    project_context = ""
    
    if request.project_id:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM business_profiles WHERE project_id = ?", (request.project_id,))
        bp = cursor.fetchone()
        if bp:
            project_context = f"Business Type: {bp['business_type']}, Subtype: {bp['business_subtype']}, Industry: {bp['industry']}, Location: {bp['location']}."
            # Guess domain based on industry or question
            if bp["industry"] == "food":
                domain = "food"
            elif bp["industry"] == "textile":
                domain = "textile"
        conn.close()

    # If domain still undetermined, inspect question keywords
    q_lower = question.lower()
    if "fssai" in q_lower or "food" in q_lower or "license" in q_lower or "paneer" in q_lower:
        domain = "food"
    elif "gst" in q_lower or "tax" in q_lower:
        domain = "gst"
    elif "msme" in q_lower or "udyam" in q_lower or "subsidy" in q_lower or "scheme" in q_lower:
        domain = "msme"
    elif "textile" in q_lower or "garment" in q_lower or "cotton" in q_lower or "mitra" in q_lower:
        domain = "textile"
    elif not domain:
        domain = "food" # Fallback to core domain

    # Search domain knowledge base
    chunks = rag.search_knowledge_base(question, domain=domain)
    context = rag.build_context(chunks)

    # Prompt Gemma
    augmented_question = f"{question}\n\nProject Context: {project_context}" if project_context else question
    answer = rag.ask_gemma(augmented_question, context)

    sources = [
        {
            "document": chunk.get("document", "Official Regulation"),
            "page": chunk.get("page"),
            "authority": chunk.get("authority"),
            "domain": chunk.get("domain", domain),
            "source_url": chunk.get("source_url")
        }
        for score, chunk in chunks
    ]

    return {
        "question": question,
        "answer": answer,
        "domain": domain,
        "sources": sources
    }
