# CLP Dashboard Builder (CDB) 🧭
**Clinical co-pilot for nutritionists at Clinic Living Plus, Bangalore.**

Paste a Gemini meeting doc → AI extracts patient profile + Q&A → generates a personalized health roadmap → share with patient via link or PDF.

---

## What it does

```
Add Patient → New Session → Paste Gemini Doc
→ AI auto-extracts profile + Q&A pairs
→ Generate Roadmap (RAG: KB + Q&A + Groq)
→ Share link with patient / Export PDF
```

---

## Setup

### 1. Clone and install
```bash
git clone https://github.com/yourusername/clp-compass.git
cd clp-compass
npm install
```

### 2. Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. SQL Editor → run `supabase/schema.sql`
3. SQL Editor → run `supabase/migration_v2_hf_embeddings.sql`
4. SQL Editor → run `supabase/migration_v3_qa.sql`

### 3. Environment variables
Create `.env.local` in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_api_key
```

### 4. Embed your Knowledge Base
```bash
cd scripts
pip install sentence-transformers python-dotenv requests
# Create scripts/.env with SUPABASE_URL and SUPABASE_SERVICE_KEY
# Put PDFs in scripts/pdfs/ → convert to txt
python pdf_to_txt.py
# Put txt files in scripts/transcripts/ → embed
python ingest_kb.py
```

### 5. Run
```bash
npm run dev
```

---

## Stack
- **Frontend** — Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Database** — Supabase (Postgres + pgvector)
- **Embeddings** — sentence-transformers `all-MiniLM-L6-v2` (local Python script)
- **LLM** — Groq (`llama-3.3-70b-versatile` + `llama-3.1-8b-instant`)
- **Design** — CLP green system (`#538A22`)

---

## Features
- ✅ Patient records with edit
- ✅ Session management with Gemini doc input
- ✅ Auto-extract patient profile + Q&A from Gemini doc
- ✅ Clinical Q&A chat (AI asks, nutritionist answers)
- ✅ RAG interpretation engine (KB + Q&A → roadmap)
- ✅ Winding road roadmap visualization (month/week pillars)
- ✅ Root cause + actions format per week
- ✅ Shareable patient document at `/share/[roadmapId]`
- ✅ PDF export via browser print
- ✅ Dashboard with live stats

---

## Project structure
```
src/app/
├── page.tsx                          # Dashboard
├── patients/                         # Patient CRUD
│   └── [id]/sessions/[sessionId]/   # Session detail + Q&A + Roadmap
│       └── interpret/               # Roadmap generation + share
├── share/[roadmapId]/               # Public patient-facing document
└── api/
    ├── patients/                     # Patient API
    ├── sessions/                     # Session API
    ├── interpret/                    # Roadmap generation (RAG + Groq)
    ├── parse-gemini/                 # Auto-extract from Gemini doc
    ├── qa/                           # Clinical Q&A
    ├── kb/                           # Knowledge base ingestion
    └── share/                        # Share link generation

scripts/
├── ingest_kb.py                      # Embed documents into pgvector
├── pdf_to_txt.py                     # Convert PDFs to txt
└── transcripts/                      # Put txt files here to ingest
```

---

## Clinic Living Plus
HSR Layout, Bangalore · [cliniclivingplus.com](https://cliniclivingplus.com)
