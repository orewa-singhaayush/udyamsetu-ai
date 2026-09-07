# UdyamSetu AI — AI Coding Agent Handoff

## 1. Purpose

This document is the handoff state for continuing the UdyamSetu AI project with Codex, Claude Code, Cursor, Gemini, or another coding agent.

**Critical instruction:** Inspect the existing code before changing anything. Preserve working components. Do not rebuild the project from scratch merely because a feature is listed in the PRD/TRD as planned.

The project is currently a **backend-first Pre-SIH prototype**. The strongest working path is:

**Business idea → Business Agent → Approval Agent → Supervisor → domain-specific RAG → Gemma 3 4B via Ollama → source-grounded answer**

The immediate product focus is **Food + Textile**, with **GST and Udyam/MSME** treated as common regulatory domains.

---

## 2. Current Repository Structure (verified from uploaded project)

```text
udyamsetu-ai/
└── backend/
    ├── app/
    │   ├── approval_agent.py
    │   ├── business_agent.py
    │   ├── chunk_pdf.py
    │   ├── embeddings.py
    │   ├── extract_pdf.py
    │   ├── main.py
    │   ├── rag.py
    │   ├── search.py
    │   ├── supervisor.py
    │   └── rag/
    │
    ├── data/
    │   ├── approvals/
    │   │   ├── food_approvals.json
    │   │   └── hospitality_approvals.json
    │   ├── food/
    │   │   ├── chunks.json
    │   │   ├── fssai_2011_regulations.pdf
    │   │   ├── fssai_license.pdf
    │   │   ├── Letter_Hygiene_Rating_States_14_06_2019.pdf
    │   │   └── Licensing & Registration.pdf
    │   ├── gst/
    │   │   ├── chunks.json
    │   │   └── cgst_act.pdf
    │   ├── fire/
    │   ├── msme/
    │   └── pollution/
    │
    └── requirements.txt   # WARNING: uploaded ZIP contains this as an empty directory, not a readable requirements file
```

The uploaded ZIP also contained `__pycache__` files. They are generated artifacts and should be excluded from future handoff ZIPs/Git commits.

There is currently **no frontend directory in the uploaded ZIP**.

---

## 3. What Is Actually Implemented

### Business Agent — IMPLEMENTED

File: `backend/app/business_agent.py`

The agent currently extracts:

- business type
- business subtype
- industry
- location
- budget/investment
- scale
- activities
- missing information

Supported business detection includes:

- restaurant
- bakery
- dairy / paneer / milk processing / cheese
- food manufacturing
- textile / garment / clothing / fabric
- automobile / EV / components

Known location detection currently includes:

- Pune
- Mumbai
- Nashik
- Nagpur
- Thane
- Aurangabad

Budget parsing supports lakh/lakhs/lac/l, crore/crores/cr, and direct rupee/INR-style amounts.

A tested example is:

> I want to start a small paneer manufacturing unit in Nashik with a budget of 2 lakh

Expected/current profile:

```text
business_type: dairy
business_subtype: paneer
industry: food
location: Nashik
budget: 200000
scale: small
activities: milk processing + paneer production
missing_information: []
```

---

## 4. Approval Agent — IMPLEMENTED, BUT FOOD/HOSPITALITY MAPPING IS STILL THE LIMITATION

File: `backend/app/approval_agent.py`

Current approval data files:

- `data/approvals/food_approvals.json`
- `data/approvals/hospitality_approvals.json`

Current food approval starter data contains:

1. FSSAI Registration / License
2. GST Registration
3. Udyam Registration
4. Fire Safety Approval / NOC
5. Pollution Control Consent

The approval records deliberately use cautious applicability/status wording such as `verify`, `conditional`, `business_dependent`, `location_and_premises_dependent`, and `activity_and_scale_dependent`.

The function `get_approval_rag_query()` generates approval-specific questions for FSSAI, GST, Udyam, Fire, and Pollution.

### Important limitation

`get_relevant_approvals()` currently loads approvals only when the detected industry is `food` or `hospitality`.

Therefore, although `business_agent.py` recognizes `textile`, the current approval agent does **not yet return textile approvals**.

This is one of the immediate next tasks.

Do not solve this by inventing a generic "Textile Approval". Textile manufacturing has multiple possible regulatory areas depending on activity, scale, premises, and location. Build a focused, evidence-backed mapping for the chosen textile scenario (especially garment manufacturing) and keep uncertain items explicitly conditional/verification-required.

---

## 5. Supervisor — IMPLEMENTED

File: `backend/app/supervisor.py`

Current flow:

```text
Business description
      ↓
Business Agent
      ↓
Structured business profile
      ↓
Approval Agent
      ↓
Relevant approvals
      ↓
For each approval:
  approval-specific RAG query
      ↓
  approval → RAG domain mapping
      ↓
  semantic retrieval
      ↓
  Gemma answer
      ↓
  save answer + RAG sources
```

Current approval → domain mapping:

```text
FSSAI      → food
GST        → gst
Udyam      → msme
Fire       → fire
Pollution  → pollution
```

For domains without a knowledge base, the Supervisor returns a clear placeholder instead of pretending that the answer is grounded.

---

## 6. RAG — IMPLEMENTED FOR FOOD/FSSAI AND GST

File: `backend/app/rag.py`

Current embedding model:

```text
SentenceTransformer: all-MiniLM-L6-v2
Embedding dimension: 384
```

Current LLM:

```text
Gemma 3 4B
Runtime: Ollama
```

Current knowledge-base paths:

```text
food → data/food/chunks.json
fssai → data/food/chunks.json
gst  → data/gst/chunks.json
```

Current retrieval uses a weighted score:

```text
55% semantic similarity
20% keyword matching
25% business-type keyword matching
```

Industry filtering allows `General` documents to remain eligible. This is important for GST because GST chunks are marked `General` rather than `Food Processing`.

Current RAG context includes metadata such as:

- Authority
- Document
- Page
- Domain
- Industry
- Year
- Content

The Gemma prompt explicitly instructs the model to:

- use only retrieved source content
- not use outside knowledge
- not invent fees, thresholds, documents, authorities, deadlines, exemptions, or legal conditions
- pay attention to conditions and exceptions
- avoid generalizing a rule from one category to another
- avoid claiming an approval is definitely required unless supported
- use cautious language
- keep the answer understandable to a business owner

This source-grounding behavior is a key product requirement. Preserve it.

---

## 7. Current Knowledge Base Status (verified)

### Food/FSSAI

`data/food/chunks.json` contains **351 chunks**.

Source PDFs present:

- `fssai_2011_regulations.pdf`
- `fssai_license.pdf`
- `Letter_Hygiene_Rating_States_14_06_2019.pdf`
- `Licensing & Registration.pdf`

The Food/FSSAI RAG has been successfully tested for the paneer manufacturing scenario.

### GST

`data/gst/chunks.json` contains **434 chunks**.

Source PDF present:

- `cgst_act.pdf`

GST retrieval was fixed so `General` industry chunks are accepted. GST RAG has been successfully tested.

### Total current embedded chunks

**785 chunks** across Food/FSSAI and GST.

### Not yet populated

```text
Textile → no chunks.json yet
MSME/Udyam → no chunks.json yet
Fire → no chunks.json yet
Pollution → no chunks.json yet
```

---

## 8. PDF/Embedding Pipeline — IMPLEMENTED

### `chunk_pdf.py`

Contains PDF text extraction, metadata generation, section-aware chunking, and folder processing.

Current chunk configuration:

```text
chunk size: 1500 characters
overlap: 250 characters
```

The chunker attempts to preserve stronger regulatory section boundaries before splitting oversized sections.

### `embeddings.py`

Processes Food and GST folders and saves embedded chunks into:

```text
data/food/chunks.json
data/gst/chunks.json
```

### `extract_pdf.py`

Simple standalone PDF extraction/testing script. It currently points to a hard-coded local Food PDF path.

### `search.py`

Older/simple standalone Food-only semantic search test. It is not the main orchestration path anymore. Do not confuse it with the newer domain-aware `rag.py`.

---

## 9. Important Code Quality / Portability Issues

These should be handled carefully, preferably after the core feature is demonstrated.

### Hard-coded Windows paths

Several files use paths such as:

```text
D:\udyamsetu-ai\backend\data
```

and `search.py` / `extract_pdf.py` also contain hard-coded absolute paths.

A later cleanup should use `pathlib.Path` and project-relative paths so the repository works on other machines and cloud environments.

### `requirements.txt`

The uploaded ZIP does **not contain a normal readable requirements.txt file**; it appears as an empty directory named `requirements.txt`.

Before another agent tries to recreate the environment, verify the real local project and generate a proper requirements file.

### `main.py`

`backend/app/main.py` is currently empty in the uploaded ZIP. There is no FastAPI application yet.

### `approval_agent.py`

Contains older standalone detection/display code in addition to functions now used by the Supervisor. Refactoring can be done later, but do not remove functions blindly because the Supervisor imports this module.

### `__pycache__`

Present in the uploaded ZIP. Remove from repository/handoff archives and add to `.gitignore`.

---

## 10. What Is NOT Implemented

Do not claim these are complete:

```text
❌ Next.js frontend
❌ FastAPI API layer
❌ PostgreSQL
❌ pgvector database storage
❌ Supabase Auth
❌ RBAC implementation
❌ RLS policies
❌ Textile RAG
❌ Udyam/MSME RAG
❌ Document management
❌ OCR/document pre-validation
❌ Application tracker
❌ Notifications/renewal alerts
❌ Scheme recommender
❌ Location recommendation agent
❌ Budget estimation agent
❌ Compliance agent
❌ Government officer workflow
❌ Admin dashboard
❌ Inspection workflow
❌ Risk-based scrutiny
❌ Government analytics dashboard
❌ Production deployment
```

These are product roadmap items, not current implementation.

---

## 11. Target Product Roles

UdyamSetu AI is intended for three roles:

### Entrepreneur

- Describe business idea
- Generate business profile
- Discover potentially relevant approvals
- Ask regulatory questions
- Later: documents, applications, schemes, notifications

### Government Officer

- Later: view/process applications
- Raise queries
- Manage inspections
- Monitor application status
- View department analytics

### Admin

- Later: manage users/officers
- Manage approval definitions
- Manage regulatory knowledge base
- Manage schemes
- Manage system configuration and analytics

For Pre-SIH, prioritize the Entrepreneur journey. Officer/Admin can be represented with basic/mock dashboards only if time permits.

---

## 12. Current Product Architecture

```text
User
 ↓
Business Agent
 ↓
Business Profile
 ↓
Approval Agent
 ↓
Potential Approvals
 ↓
Approval-specific RAG Query
 ↓
Domain RAG
 ↓
Semantic Retrieval
 ↓
Retrieved Regulatory Sources
 ↓
Gemma 3 4B / Ollama
 ↓
Simple Source-grounded Guidance
```

Future web architecture:

```text
Next.js
   ↓
FastAPI
   ↓
Supervisor
   ↓
Business + Approval + RAG
   ↓
Gemma/Ollama
```

Future persistence:

```text
Supabase Auth
      +
PostgreSQL
      +
pgvector
      +
private document storage
```

---

## 13. Pre-SIH Priority Order

Follow this order unless the user explicitly changes priorities.

### Priority 1 — Textile RAG

Build a focused, authoritative Textile/Garment knowledge base.

Minimum target:

```text
Textile source documents
      ↓
PDF extraction
      ↓
chunk_pdf.py
      ↓
embeddings.py
      ↓
data/textile/chunks.json
      ↓
rag.py domain support
```

Also update approval mapping so a textile/garment business can receive appropriate potential approval categories.

### Priority 2 — Udyam/MSME RAG

Add an authoritative Udyam/MSME knowledge base because it is reusable across Food and Textile.

Target:

```text
Food ──────┐
           ├── Udyam/MSME
Textile ───┘
```

### Priority 3 — FastAPI

Turn the current working Python orchestration into a small REST API.

Minimum endpoint direction:

```text
POST /api/business/analyze
POST /api/business/process
POST /api/ai/query
GET  /api/health
```

Keep the first API thin. Do not introduce unnecessary microservices.

### Priority 4 — Next.js frontend

Build only the strongest demo screens first:

```text
/
/login
/signup
/onboarding
/dashboard
/approvals
/approvals/[id]
/ai-assistant
/profile
```

### Priority 5 — End-to-end integration

Connect:

```text
Next.js → FastAPI → Supervisor → RAG → Gemma
```

### Priority 6 — PostgreSQL/Supabase

Only after the core web flow is stable, integrate persistent storage and authentication.

---

## 14. Recommended Demo Scenarios

### Food

```text
I want to start a small paneer manufacturing unit in Nashik with a budget of ₹2 lakh.
```

Expected concept:

```text
Dairy
Paneer
Food
Nashik
₹2 lakh
Small
```

Potential approvals currently represented by the starter mapping:

- FSSAI
- GST
- Udyam
- Fire Safety
- Pollution Control

FSSAI and GST should produce grounded RAG answers. Udyam/Fire/Pollution currently have no configured KB and must not be presented as source-grounded AI answers yet.

### Textile

```text
I want to start a small garment manufacturing unit in Pune with a budget of ₹10 lakh.
```

This should be the main test case after Textile RAG is implemented.

---

## 15. Coding Rules for the Next Agent

1. **Inspect first.** Read the existing repository and run/test the current backend before modifying it.
2. **Do not rebuild working agents.** Business Agent, Approval Agent, Supervisor, RAG, Food RAG, and GST RAG already exist.
3. **Do not assume the PRD means implemented.** Use this handoff document plus actual source code as the implementation truth.
4. **Preserve source-grounded RAG behavior.** Do not make Gemma answer from unrestricted general knowledge for regulatory questions.
5. **Do not invent government requirements.** If the knowledge base lacks evidence, say so or leave the domain unconfigured.
6. **Keep the MVP simple.** Avoid premature LangGraph complexity, OCR, full workflow automation, or deployment optimization before the core demo works.
7. **Use relative/configurable paths.** Do not add new hard-coded `D:\...` paths.
8. **Do not commit secrets.** Never commit `.env`, API keys, Supabase service-role keys, tokens, passwords, or private documents.
9. **Exclude generated files.** Do not commit `venv/`, `node_modules/`, `__pycache__/`, or other build artifacts.
10. **Test after changes.** At minimum, run the existing business/approval/RAG scenario after modifying the backend.
11. **Prefer incremental changes.** Make one coherent feature at a time and avoid broad rewrites.
12. **Before major architectural changes, explain the reason and impact.**

---

## 16. First Instruction to a New Coding Agent

Use this as the initial prompt when handing the project to another coding AI:

> You are continuing an existing UdyamSetu AI project. Do NOT rebuild it from scratch. First inspect the repository and this `AI_HANDOFF.md`. Run the existing backend/test path and verify what currently works. Treat the actual source code as the implementation truth. Preserve the existing Business Agent, Approval Agent, Supervisor, RAG pipeline, Food/FSSAI RAG, GST RAG, and Gemma/Ollama integration. Then implement the highest-priority unfinished task listed in this document, starting with Textile RAG. Before making major architectural changes, report what you found and why the change is necessary.

---

## 17. Definition of Pre-SIH Success

The strongest acceptable Pre-SIH prototype is:

```text
Business Idea
     ↓
AI understands business
     ↓
Structured Business Profile
     ↓
Potential Approval Checklist
     ↓
Approval Details
     ↓
Relevant Regulatory RAG
     ↓
Gemma Explanation
     ↓
Verified Source Metadata
```

The two primary demonstrations are:

1. Paneer manufacturing / Food in Nashik
2. Garment manufacturing / Textile in Pune

The goal is a convincing, working, source-grounded AI approval discovery prototype — not a fully deployed government application-processing platform yet.
