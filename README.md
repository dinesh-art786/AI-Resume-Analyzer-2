# AI Resume Analyzer

Beginner-friendly full-stack project: React frontend, FastAPI backend, SQLite database, and scikit-learn NLP matching.

## Install
- Python 3.10+
- Node.js LTS
- VS Code

## Backend (VS Code terminal 1)
```bash
cd backend
python -m venv venv
```
Activate:
- Windows PowerShell: `.env\Scripts\Activate.ps1`
- Windows CMD: `venv\Scripts\activate`
- macOS/Linux: `source venv/bin/activate`

Then:
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```
API: http://127.0.0.1:8000  
API docs: http://127.0.0.1:8000/docs

## Frontend (VS Code terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Open the URL Vite prints, usually http://localhost:5173.

## How it works
Upload a text-based PDF or DOCX, paste a job description, and click Analyze Resume. The backend extracts text, calculates TF-IDF cosine similarity, checks a starter skills vocabulary, creates suggestions, and saves the result to SQLite.

The score combines 70% text similarity and 30% skill coverage. It is an educational estimate, not a hiring decision. Scanned PDFs need OCR, which is not included in this starter version.

Use sample/non-sensitive resumes while testing. For production, add authentication, secure file handling, deletion controls, rate limiting and stronger privacy protections.
