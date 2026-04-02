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

### 1. Backend
```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

### 2. AI Service
```powershell
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend
```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

## Services

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- AI Service: `http://localhost:8000`

## Current Status

PlayerIQ now includes:

- a FastAPI AI service for ratings, playstyles, pressure analytics, reports, momentum, turning points, and simulated live match feeds
- an Express backend with auth, player analytics routes, match analysis routes, simulation orchestration, persistence hooks, and runtime health reporting
- a React frontend with auth, dashboard, player profile, comparison, match analysis, and realtime simulation controls

## Environment Files

- `backend/.env.example`
- `ai-service/.env.example`
- `frontend/.env.example`

Important:
- set a real `JWT_SECRET` in backend `.env`
- keep backend `AI_SERVICE_URL` aligned with the AI service host/port
- keep frontend `VITE_API_BASE_URL` and `VITE_SOCKET_URL` aligned with the backend host/port

## Verification

Frontend:
```powershell
cd frontend
npm run build
```

Backend:
```powershell
cd backend
npm test
```

AI service:
```powershell
cd ai-service
.\.venv\Scripts\python.exe -m unittest discover -s tests
```

## Deployment Notes

Deployment guidance and production checklist are in `docs/DEPLOYMENT.md`.
