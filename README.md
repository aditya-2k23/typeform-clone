# Typeform Clone

A full-stack Typeform-style form builder and response collector.

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | Next.js (TypeScript, App Router, Tailwind CSS) |
| Backend  | FastAPI (Python)                    |
| Database | SQLite via SQLAlchemy               |

## Project Structure

```
typeform-clone/
├── frontend/          # Next.js app
├── backend/           # FastAPI app
│   ├── main.py        # App entry point & health-check route
│   ├── database.py    # SQLAlchemy engine & session setup
│   ├── models.py      # ORM models (Form, Question, etc.)
│   ├── seed.py        # Seed script for sample data
│   └── requirements.txt
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts at [http://localhost:3000](http://localhost:3000).

---

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API starts at [http://localhost:8000](http://localhost:8000).  
Health check: [http://localhost:8000/health](http://localhost:8000/health)

---

### Seed the Database

After the backend dependencies are installed:

```bash
cd backend
python seed.py
```

This creates sample forms, questions, and responses in a local SQLite database (`typeform_clone.db`).
