# PlayerIQ

PlayerIQ is a football player intelligence platform with three main parts:

- `frontend/`: React + Vite dashboard
- `backend/`: Express API, auth, Socket.IO, and MongoDB integration
- `ai-service/`: FastAPI analytics service for ratings, playstyles, reports, and match insights

Local data and generated artifacts live in `data/`, while extra setup notes live in `docs/`.

## How To Download The Project

### Option 1: Clone with Git

```powershell
git clone https://github.com/RatandeepCodes/PlayerIQ.git
cd PlayerIQ
```

### Option 2: Download as a ZIP

1. Open the repository on GitHub.
2. Click `Code` > `Download ZIP`.
3. Extract the ZIP file.
4. Open PowerShell inside the extracted `PlayerIQ` folder.

## Prerequisites

Install these before running the project:

- Node.js and `npm`
- Python 3
- Git (only needed if you want to clone the repo)
- MongoDB Community Server or a MongoDB Atlas connection recommended for full backend functionality

Notes:

- The backend can still start in development if MongoDB is unavailable, but database-backed features may not work correctly.
- `FOOTBALL_DATA_API_TOKEN` is optional unless you want external football-data integration.

## Project Structure

```text
PlayerIQ/
  README.md
  PRD.md
  frontend/      React + Vite client
  backend/       Express API + auth + sockets
  ai-service/    FastAPI analytics service
  data/          Local datasets and generated files
  docs/          Deployment and supporting notes
  scripts/       Data import and helper scripts
```

## Setup Instructions

These steps assume you are using PowerShell on Windows.

### 1. Set up the backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Important backend settings in `backend/.env`:

- `JWT_SECRET`: change this from `change-me`
- `MONGODB_URI`: keep the default local value or replace it with your Atlas connection string
- `AI_SERVICE_URL`: should point to the FastAPI service, default `http://127.0.0.1:8000`
- `CLIENT_ORIGIN`: should match the frontend URL, default `http://localhost:5173`
- `FOOTBALL_DATA_API_TOKEN`: optional

### 2. Set up the AI service

```powershell
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
Copy-Item .env.example .env
```

If PowerShell blocks virtual-environment activation, use the Python executable directly instead:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Important AI service settings in `ai-service/.env`:

- `DATA_PATH=../data`
- `MODEL_PATH=./models`

### 3. Set up the frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

Important frontend settings in `frontend/.env`:

- `VITE_API_BASE_URL=http://localhost:5000/api`
- `VITE_SOCKET_URL=http://localhost:5000`

## How To Run The Project

Run each service in a separate terminal from the repository root.

### Terminal 1: Start the AI service

```powershell
cd ai-service
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

If you did not activate the virtual environment:

```powershell
cd ai-service
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

### Terminal 2: Start the backend

```powershell
cd backend
npm run dev
```

### Terminal 3: Start the frontend

```powershell
cd frontend
npm run dev
```

## Default Local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Backend health check: `http://localhost:5000/api/health`
- AI service: `http://localhost:8000`
- AI service health check: `http://localhost:8000/health`

Open `http://localhost:5173` in your browser after all three services are running.

## Optional: Refresh The StatsBomb Open Data Files

This helper script downloads the public StatsBomb open-data archive and rebuilds the local player and match directories used by the project.

```powershell
cd scripts
python import_statsbomb_open_data.py
```

Generated files are written to:

- `data/sources/statsbomb_open_data/player_directory.csv`
- `data/sources/statsbomb_open_data/match_directory.csv`

## How To Verify Everything Is Working

### Frontend

```powershell
cd frontend
npm run build
```

### Backend

```powershell
cd backend
npm test
```

### AI service

```powershell
cd ai-service
.\.venv\Scripts\python.exe -m unittest discover -s tests
```

## Troubleshooting

- If the frontend loads but data does not appear, check that the backend and AI service are both running.
- If `http://localhost:5000/api/health` returns `degraded`, the most common causes are MongoDB not running, the AI service not running, or the backend still using the default `JWT_SECRET`.
- If the frontend cannot connect, confirm that `frontend/.env` matches the backend port.
- If the backend cannot reach the AI service, confirm that `backend/.env` has the correct `AI_SERVICE_URL`.

## Copyright And Disclaimer

- This repository does not currently include a `LICENSE` file. Unless the project owner adds one, treat the source code as all rights reserved by its author(s).
- Third-party datasets, APIs, names, logos, and trademarks referenced by this project remain the property of their respective owners.
- Data under `data/sources/` may be subject to separate usage terms from the original providers, including StatsBomb open data, Kaggle-hosted datasets, and any external football APIs. Review and follow those source terms before redistributing or using the data commercially.
- This project is intended for development, learning, research, and demonstration. Validate all analytics outputs independently before using them in scouting, business, or operational decisions.

## Deployment

Production deployment notes are available in `docs/DEPLOYMENT.md`.
