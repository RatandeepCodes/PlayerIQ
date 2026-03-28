# PlayerIQ

PlayerIQ is an AI-driven football player intelligence platform that turns event-level match data into player ratings, playstyle classification, performance analytics, pressure analysis, comparisons, AI summaries, and simulated live insights.

## Workspace Layout

```text
PlayerIQ/
  PRD.md
  frontend/      # React + Vite dashboard
  backend/       # Express API + auth + MongoDB integration
  ai-service/    # FastAPI analytics and ML service
  data/          # Local datasets and examples
  docs/          # Supporting documentation
  scripts/       # Helper scripts for setup and data workflows
```

## Quick Start

### Backend
```powershell
cd backend
npm install
npm run dev
```

### AI Service
```powershell
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

## Services

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- AI Service: `http://localhost:8000`

## Current Status

This repository currently includes the initial project scaffold, service boundaries, starter routes, placeholder analytics logic, and a dashboard shell ready for feature implementation.

