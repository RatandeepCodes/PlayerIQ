# Deployment Guide

## Service Targets

- Frontend: Vercel
- Backend: Render
- AI Service: Railway
- Database: MongoDB Atlas

## Frontend

Required environment variables:

```env
VITE_API_BASE_URL=https://your-backend-domain/api
VITE_SOCKET_URL=https://your-backend-domain
```

Build command:

```bash
npm run build
```

## Backend

Required environment variables:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=https://your-ai-service-domain
CLIENT_ORIGIN=https://your-frontend-domain
```

Readiness checks:

- `/api/health` should report backend online
- `database` should be `connected`
- `aiService` should be `online`
- `config.warnings` should be empty in production

## AI Service

Required environment variables:

```env
APP_NAME=PlayerIQ AI Service
APP_ENV=production
DATA_PATH=../data
MODEL_PATH=./models
```

Readiness checks:

- `/health` should return `ok` or a clearly explained `degraded` state
- source files should appear in `sources.available_sources`
- `warnings` should be empty for a fully healthy deployment

## Final Pre-Deploy Checklist

1. Frontend `npm run build` passes.
2. Backend `npm test` passes.
3. AI test suite passes from the project venv.
4. `JWT_SECRET` is not using the default fallback.
5. MongoDB is reachable from the deployed backend.
6. Backend can reach the deployed AI service.
7. Frontend API and socket URLs point to the deployed backend.
8. Login, player profile, comparison, and match simulation work end to end.
