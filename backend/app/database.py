import os
import json
import sqlite3
import uuid
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_DIR = BASE_DIR / "data"
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "udyamsetu.db"

UPLOADS_DIR = DB_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'entrepreneur',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Projects
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 3. Business Profiles
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS business_profiles (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL UNIQUE,
        business_type TEXT,
        business_subtype TEXT,
        industry TEXT,
        location TEXT,
        budget REAL,
        scale TEXT,
        activities TEXT, -- JSON array
        missing_information TEXT, -- JSON array
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    """)

    # 4. Approvals Master
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS approvals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        authority TEXT NOT NULL,
        industry TEXT,
        description TEXT,
        source_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 5. Project Approvals
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS project_approvals (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        approval_name TEXT NOT NULL,
        authority TEXT,
        status TEXT NOT NULL DEFAULT 'identified',
        applicability TEXT NOT NULL DEFAULT 'potentially_applicable',
        ai_reason TEXT,
        rag_domain TEXT,
        rag_query TEXT,
        rag_answer TEXT,
        sources TEXT, -- JSON array
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    """)

    # 6. Required Documents Master
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS required_documents (
        id TEXT PRIMARY KEY,
        approval_name TEXT NOT NULL,
        document_name TEXT NOT NULL,
        document_type TEXT NOT NULL,
        description TEXT,
        is_required INTEGER DEFAULT 1,
        source_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 7. Project Documents
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS project_documents (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        required_document_id TEXT,
        user_id TEXT NOT NULL,
        document_name TEXT NOT NULL,
        document_type TEXT,
        approval_name TEXT,
        file_url TEXT,
        file_name TEXT,
        file_size INTEGER,
        mime_type TEXT,
        status TEXT NOT NULL DEFAULT 'missing', -- 'uploaded', 'missing', 'needs_review', 'not_applicable'
        verification_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'valid', 'invalid', 'needs_review'
        uploaded_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    """)

    # 8. AI Conversations
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        project_id TEXT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        domain TEXT,
        sources TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()

    # Seed master approvals and required documents
    seed_master_data(conn)
    conn.close()

def seed_master_data(conn):
    cursor = conn.cursor()
    
    # Default demo user
    cursor.execute("SELECT id FROM users WHERE id = 'user-default-1'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO users (id, email, full_name, role)
        VALUES ('user-default-1', 'entrepreneur@udyamsetu.ai', 'Aayush Singh', 'entrepreneur')
        """)

    # Standard approvals
    master_approvals = [
        ("appr-fssai", "FSSAI Registration / License", "Food Safety and Standards Authority of India (FSSAI)", "food", "Mandatory licensing or registration for food business operators based on manufacturing capacity and turnover.", "https://foscos.fssai.gov.in/"),
        ("appr-gst", "GST Registration", "Goods and Services Tax Network (GSTN)", "general", "Registration under Central & State GST for inter-state supply, threshold turnover, or voluntary compliance.", "https://www.gst.gov.in/"),
        ("appr-udyam", "Udyam Registration", "Ministry of Micro, Small and Medium Enterprises", "msme", "Official zero-cost national MSME registration providing priority lending, subsidies, and government tender benefits.", "https://udyamregistration.gov.in/"),
        ("appr-fire", "Fire Safety Approval / NOC", "State / Municipal Fire Service Department", "safety", "Fire safety clearance verifying adequate firefighting measures, building layout, and emergency egress.", "https://mahafireservice.gov.in/"),
        ("appr-pollution", "Pollution Control Consent", "State Pollution Control Board (e.g. MPCB)", "environment", "Consent to Establish (CTE) and Consent to Operate (CTO) under Water & Air Pollution Control Acts.", "https://mpcb.gov.in/"),
        ("appr-textile", "Textile and Garment Schemes / Infrastructure", "Ministry of Textiles", "textile", "Special textile infrastructure and capital subsidy initiatives such as PM MITRA and PLI Schemes.", "https://texmin.nic.in/")
    ]

    for a_id, name, auth, ind, desc, url in master_approvals:
        cursor.execute("""
        INSERT OR IGNORE INTO approvals (id, name, authority, industry, description, source_url)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (a_id, name, auth, ind, desc, url))

    # Standard required documents per approval
    master_docs = [
        # FSSAI
        ("FSSAI Registration / License", "Identity Proof of Operator", "identity", "Aadhaar Card, Voter ID, or Passport of the business owner / authorized partner.", 1, "https://foscos.fssai.gov.in/"),
        ("FSSAI Registration / License", "Proof of Business Constitution", "legal", "Partnership deed, MOA/AOA, or Certificate of Incorporation / Proprietorship declaration.", 1, "https://foscos.fssai.gov.in/"),
        ("FSSAI Registration / License", "Proof of Premises Possession", "premises", "Rent agreement + NOC from landlord, or Property ownership electricity bill / sale deed.", 1, "https://foscos.fssai.gov.in/"),
        ("FSSAI Registration / License", "Food Safety Management System (FSMS) Plan", "technical", "Self-declaration of FSMS plan conforming to Schedule 4 hygiene requirements.", 1, "https://foscos.fssai.gov.in/"),
        ("FSSAI Registration / License", "Equipment & Machinery Layout", "technical", "List of processing equipment, machinery horsepower, and planned production capacity.", 0, "https://foscos.fssai.gov.in/"),
        
        # GST
        ("GST Registration", "PAN Card of Business / Proprietor", "identity", "Permanent Account Number card of the enterprise or individual owner.", 1, "https://www.gst.gov.in/"),
        ("GST Registration", "Aadhaar Card of Authorized Signatory", "identity", "Aadhaar card for biometric/OTP authentication of authorized person.", 1, "https://www.gst.gov.in/"),
        ("GST Registration", "Proof of Principal Place of Business", "premises", "Electricity bill, property tax receipt, or registered lease deed + NOC.", 1, "https://www.gst.gov.in/"),
        ("GST Registration", "Bank Account Details", "financial", "Cancelled cheque or first page of passbook showing account name and IFSC.", 1, "https://www.gst.gov.in/"),
        ("GST Registration", "Authorization Letter / Board Resolution", "legal", "Letter of authorization for the designated primary signatory.", 1, "https://www.gst.gov.in/"),

        # Udyam
        ("Udyam Registration", "Aadhaar Number of Entrepreneur", "identity", "Aadhaar number of proprietor, managing partner, or authorized director.", 1, "https://udyamregistration.gov.in/"),
        ("Udyam Registration", "PAN of the Enterprise", "financial", "PAN details linked to Income Tax and GST database for automatic turnover verification.", 1, "https://udyamregistration.gov.in/"),
        ("Udyam Registration", "Bank Account & IFSC Details", "financial", "Bank details for direct benefit transfers and government scheme credits.", 1, "https://udyamregistration.gov.in/"),
        ("Udyam Registration", "Plant & Machinery Investment Statement", "financial", "Written down value (WDV) or invoice copy of machinery and equipment.", 0, "https://udyamregistration.gov.in/"),

        # Fire Safety
        ("Fire Safety Approval / NOC", "Architectural Site & Floor Plan", "technical", "Building blueprint certified by registered architect showing entry/exit gates.", 1, "https://mahafireservice.gov.in/"),
        ("Fire Safety Approval / NOC", "Fire Fighting Equipment Layout", "safety", "Detailed layout map showing fire extinguishers, hydrants, smoke alarms, and water tank.", 1, "https://mahafireservice.gov.in/"),
        ("Fire Safety Approval / NOC", "Building Occupancy / Completion Certificate", "legal", "Certificate from local municipal corporation or planning authority.", 1, "https://mahafireservice.gov.in/"),

        # Pollution Control
        ("Pollution Control Consent", "Manufacturing Process Flow Chart", "technical", "Step-by-step flowchart showing raw material inputs, processing steps, and emissions/waste.", 1, "https://mpcb.gov.in/"),
        ("Pollution Control Consent", "Effluent & Sewage Treatment Proposal", "environment", "Scheme details for wastewater handling, ETP capacity, or soak pit arrangement.", 1, "https://mpcb.gov.in/"),
        ("Pollution Control Consent", "Site Layout & Topographical Map", "premises", "Map showing unit boundaries, nearest water body, and residential proximity.", 1, "https://mpcb.gov.in/"),

        # Textile Schemes
        ("Textile and Garment Schemes / Infrastructure", "Project DPR (Detailed Project Report)", "financial", "Comprehensive project report outlining investment, employment generation, and production capacity.", 1, "https://texmin.nic.in/"),
        ("Textile and Garment Schemes / Infrastructure", "Machinery Invoices / Quotations", "financial", "Authorized manufacturer quotations or purchase invoices for modern textile machinery.", 1, "https://texmin.nic.in/")
    ]

    for app_name, doc_name, doc_type, desc, is_req, url in master_docs:
        cursor.execute("""
        SELECT id FROM required_documents WHERE approval_name = ? AND document_name = ?
        """, (app_name, doc_name))
        if not cursor.fetchone():
            d_id = f"reqdoc-{uuid.uuid4().hex[:8]}"
            cursor.execute("""
            INSERT INTO required_documents (id, approval_name, document_name, document_type, description, is_required, source_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (d_id, app_name, doc_name, doc_type, desc, is_req, url))

    conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
