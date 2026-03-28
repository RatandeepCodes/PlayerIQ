# PlayerIQ - Product Requirements Document

## 1. Product Overview

### Product Name
PlayerIQ - AI-Driven Football Player Intelligence System

### Product Vision
PlayerIQ transforms football event-level match data into actionable player intelligence for analysts, scouts, coaches, and fans. The platform ingests detailed match events, engineers player features, runs AI/ML models, and delivers live and historical insights through a modern web dashboard.

### Problem Statement
Raw football event data is difficult to interpret quickly at the player level. Analysts often need multiple tools to understand player contribution, role fit, performance under pressure, and live match impact. PlayerIQ centralizes these workflows into one intelligent platform.

### Core Objective
Build a full-stack football analytics platform that converts event-level data into:

- Player ratings similar to FIFA/EA Sports FC style ratings
- Attribute ratings such as shooting, passing, dribbling, defending, creativity, and physical
- Playstyle classification using machine learning
- Player Performance Index (PPI)
- Pressure Performance Index
- Player comparison analytics
- AI-generated scouting/performance reports
- Real-time or simulated real-time player analytics

## 2. Goals And Success Criteria

### Primary Goals
- Ingest football event-level datasets such as StatsBomb Open Data
- Generate meaningful player-level features from match events
- Provide interpretable AI-driven player intelligence
- Support both historical analysis and simulated live analysis
- Deliver a secure, production-ready web application with modular services

### Success Criteria
- A user can authenticate and access a dashboard securely
- A user can view a player profile with rating, attributes, playstyle, PPI, pressure index, charts, and AI summary
- A user can compare two players side by side
- A user can analyze match-level momentum and turning points
- A user can start simulated live analysis and see metrics update as events stream in
- The platform supports extensible ML pipelines and additional models over time

## 3. Target Users

### Primary Users
- Football analysts
- Scouts and recruitment teams
- Coaches and performance staff
- Sports media and content creators

### Secondary Users
- Fans interested in advanced football analysis
- Students building sports analytics portfolios

## 4. User Stories

- As a user, I want to register and log in securely so that I can access private analytics.
- As an analyst, I want to inspect a player’s overall and attribute ratings so that I can evaluate performance quickly.
- As a scout, I want to understand a player’s playstyle so that I can assess role fit.
- As a coach, I want to compare two players so that I can make tactical or selection decisions.
- As an analyst, I want to identify turning points in a match so that I can explain momentum shifts.
- As a user, I want live or simulated live analytics so that I can track player impact during the match.
- As a user, I want AI-generated summaries so that I can consume insights quickly without reading raw stats.

## 5. Scope

### In Scope
- Historical event data ingestion
- Feature engineering from football event data
- AI microservice for analytics and model inference
- Node.js backend for authentication, orchestration, and API aggregation
- MongoDB persistence layer
- React dashboard with charts and live views
- Simulated real-time event streaming
- Player profile, comparison, dashboard, and match analysis pages

### Out Of Scope For V1
- Direct live feed integrations from paid data providers
- Team-level tactical video analysis
- Manual data labeling platform
- Native mobile apps
- Advanced LLM fine-tuning or multi-language reporting

## 6. Functional Requirements

### 6.1 Data Ingestion
- The system must ingest event-level football datasets such as StatsBomb Open Data.
- The ingestion pipeline must support event fields including:
  - `match_id`
  - `minute`
  - `second`
  - `timestamp`
  - `player`
  - `player_id`
  - `team`
  - `team_id`
  - `event_type`
  - `outcome`
  - `xG` if available
  - pass-related fields
  - shot-related fields
  - defensive action fields
  - location coordinates where available
- The system must normalize raw event data into a consistent schema for downstream analytics.

### 6.2 Feature Engineering Engine
- The platform must aggregate event data into player-level features for a match, season, or selected time window.
- The feature engine must compute offensive, defensive, creative, and physical proxies from events.
- The engine must support both batch processing and incremental updates for live simulation.

### 6.3 Player Attribute And Rating Engine
- The platform must derive attribute scores for:
  - Shooting
  - Passing
  - Dribbling
  - Defending
  - Creativity
  - Physical
- All attribute scores must be normalized to a 0-100 scale.
- The system must derive an overall rating from weighted attribute scores.
- Ratings must be transparent and reproducible from event-derived formulas.

### 6.4 Playstyle Profiling
- The platform must classify players using unsupervised clustering.
- Initial clustering method: KMeans.
- Input features should include:
  - pass accuracy
  - progressive passes or key passes
  - shot volume
  - xG contribution
  - dribbles attempted/successful
  - defensive actions
  - ball recoveries/interceptions
- The system must map clusters to interpretable roles:
  - Playmaker
  - Striker
  - Defender
  - Box-to-box
  - Winger

### 6.5 Player Performance Index (PPI)
- The platform must compute a normalized 0-100 PPI.
- PPI must combine offensive and defensive contributions using a weighted formula.
- PPI must support:
  - single match view
  - rolling recent form
  - aggregated season view

### 6.6 Pressure Performance Model
- The platform must identify pressure situations using initial V1 rules:
  - final 15 minutes of the match
  - score difference less than or equal to 1
- The system must compare player output under pressure against normal conditions.
- Pressure Index must be computed as:
  - `pressure performance / normal performance`
- The index must be presented with both raw value and normalized score.

### 6.7 Player Comparison Engine
- The platform must allow side-by-side comparison of two players.
- The system must render radar charts, stat deltas, and textual comparison summaries.
- Users must be able to compare:
  - overall rating
  - attributes
  - PPI
  - pressure index
  - playstyle
  - selected core event stats

### 6.8 Turning Point Detection
- The platform must detect momentum shifts in a match using event intensity over time.
- Initial signals may include:
  - shots
  - xG spikes
  - interceptions
  - entries into dangerous zones
  - tackles and recoveries
- The system must surface identified turning points on a time-series chart.

### 6.9 AI Report Generator
- The platform must generate natural language summaries from player analytics.
- Reports must include:
  - strengths
  - weaknesses
  - impact summary
  - pressure performance note
  - recommended role/playstyle interpretation
- V1 may use template-driven generation or a local summarization layer built from computed insights.

### 6.10 Real-Time Or Simulated Real-Time Analytics
- The system must support simulated streaming of match events in sequence.
- As events stream:
  - player stats must update
  - feature aggregates must update
  - ratings and indices must recalculate
  - the dashboard must refresh in near real time
- The simulation must allow start, pause, resume, speed control, and reset.

### 6.11 Authentication And Authorization
- The backend must support user registration and login using JWT authentication.
- Protected routes must require a valid access token.
- Passwords must be hashed securely before storage.

## 7. Non-Functional Requirements

- Clean modular code structure across services
- Secure API design and secret handling
- Scalable microservice separation between frontend, backend, AI service, and database
- Fast enough for interactive analytics and simulated live updates
- Resilient to missing optional fields such as xG
- Observable services with logging and clear error responses
- Environment-based configuration for local and deployed environments

## 8. System Architecture

### High-Level Architecture
Football Event Data  
-> Feature Engineering Engine (Python)  
-> Machine Learning Models  
-> Analytics Engine  
-> FastAPI AI Microservice  
-> Node.js Backend (Auth + API Layer)  
-> MongoDB Database  
-> React Frontend Dashboard

### Service Responsibilities

#### React Frontend
- Authentication UI
- Dashboard and player exploration UI
- Live analytics dashboard
- Comparison views and charts
- Match analysis timeline

#### Node.js Backend
- User authentication and JWT issuance
- API gateway for frontend requests
- Data orchestration between frontend, MongoDB, and AI service
- Persistence of analytics snapshots and user-facing entities
- Secure route handling

#### FastAPI AI Microservice
- Data preprocessing
- Feature engineering orchestration
- Model training and inference
- Rating, playstyle, pressure, comparison, and report generation
- Real-time incremental analytics updates

#### MongoDB
- User records
- Player metadata and cached profiles
- Stored analytics results and historical snapshots

## 9. Data Model Requirements

### Collections

#### Users
- `_id`
- `name`
- `email`
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

#### Players
- `_id`
- `playerId`
- `name`
- `team`
- `position`
- `nationality`
- `age`
- `metadata`
- `createdAt`
- `updatedAt`

#### AnalyticsResults
- `_id`
- `playerId`
- `matchId`
- `season`
- `overallRating`
- `attributes`
- `playstyle`
- `ppi`
- `pressureIndex`
- `report`
- `comparisonCache`
- `timeSeries`
- `createdAt`
- `updatedAt`

### Event Schema Requirements
- Store or load normalized event objects with consistent field names
- Include enough context to determine score state, timing, and event contribution
- Preserve raw identifiers for match, player, and team

## 10. AI And Analytics Requirements

### 10.1 Rating Engine Logic

#### Example Derived Inputs
- Shooting:
  - shots
  - shots on target
  - goals
  - xG overperformance/underperformance
- Passing:
  - pass completion
  - progressive passes
  - key passes
  - assists or expected assists proxies
- Dribbling:
  - dribbles attempted
  - dribbles completed
  - carry progression if available
- Defending:
  - tackles
  - interceptions
  - clearances
  - pressures/duels won if available
- Creativity:
  - key passes
  - chances created
  - through balls
  - shot-creating actions proxies
- Physical:
  - duel wins
  - recoveries
  - repeated late-match actions
  - defensive work rate proxy

#### Rating Formula Guidance
- Use min-max or z-score normalization before mapping to 0-100
- Apply position-aware weights in later iterations
- Initial V1 overall rating can be a weighted average of six attributes

### 10.2 Playstyle Model Requirements
- Train clustering on aggregated player vectors
- Standardize features before clustering
- Store cluster assignment and label mapping
- Provide confidence or distance-to-centroid as an interpretability signal if feasible

### 10.3 Performance Index Requirements

#### Example PPI Formula
`PPI = normalized(offensive_score * w1 + defensive_score * w2 + creative_score * w3 + efficiency_score * w4)`

- Weights must be configurable
- The scoring breakdown must be exposed for debugging/admin use

### 10.4 Pressure Model Requirements
- The engine must segment player events into pressure and non-pressure windows
- It must compute pressure-adjusted output metrics such as:
  - pass completion under pressure
  - xG contribution under pressure
  - defensive actions under pressure
  - possession actions under pressure
- The final index must clearly indicate whether the player improves, maintains, or declines under pressure

### 10.5 Turning Point Detection Requirements
- Use time-bucket aggregation such as 1-minute or 5-minute windows
- Detect spikes and momentum swings using rolling averages or change-point heuristics
- Highlight the player(s) most involved in each turning point

### 10.6 Report Generation Requirements
- AI reports must be grounded in computed metrics
- Generated output must avoid unsupported claims
- Reports must be concise, readable, and suitable for dashboard display

## 11. API Requirements

### Node.js Backend API

#### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

#### Players
- `GET /api/player/:id`
- `GET /api/player/:id/profile`
- `GET /api/player/compare?player1=:id&player2=:id`
- `GET /api/player/:id/live`

#### Matches
- `GET /api/matches/:id/analysis`
- `POST /api/matches/:id/simulate`

### FastAPI AI Microservice
- `GET /rating/{player_id}`
- `GET /playstyle/{player_id}`
- `GET /pressure/{player_id}`
- `GET /compare/{player1}/{player2}`
- `GET /report/{player_id}`
- `POST /simulate/match/{match_id}`
- `GET /match/{match_id}/turning-points`

### Response Requirements
- APIs must return JSON
- Errors must return structured JSON with message and status code
- Long-running simulation routes should support streaming or polling patterns in later iterations

## 12. Frontend Requirements

### Pages
- Login/Register
- Dashboard
- Player Profile
- Player Comparison
- Match Analysis

### Dashboard Requirements
- Overview cards for top-rated players, strongest performers, and pressure leaders
- Filters by team, player, match, season, and role
- Recent analytics summary

### Player Profile Requirements
- FIFA-style player card
- Attribute breakdown
- Overall rating
- Playstyle tag
- PPI and pressure index
- AI-generated summary
- Match-by-match trend charts

### Player Comparison Requirements
- Dual player selection
- Radar chart comparison
- KPI stat table
- Narrative comparison summary

### Match Analysis Requirements
- Timeline of events and turning points
- Live or simulated live updates
- Momentum graph
- Dynamic player leaderboard during simulation

### Visualization Requirements
- Radar charts
- Line charts
- Bar charts
- KPI cards
- Time-series momentum chart

## 13. Real-Time Simulation Requirements

### Simulation Flow
1. Load normalized events for a selected match
2. Sort events by timestamp
3. Emit events sequentially through a simulation service
4. Incrementally update player and match aggregates
5. Re-run lightweight rating and analytics calculations
6. Publish updates to frontend clients

### Real-Time Delivery Options
- V1 recommended: WebSocket or Socket.IO between backend and frontend
- Backend may poll the AI service or receive push updates from the simulation engine

### Live Metrics To Update
- player event counts
- live rating
- live PPI
- pressure event counts
- momentum chart
- turning point markers

## 14. Security Requirements

- Hash passwords using bcrypt or equivalent
- Protect private routes with JWT middleware
- Validate all incoming request payloads
- Restrict CORS by environment
- Keep secrets in environment variables
- Sanitize user inputs and query parameters

## 15. Deployment Requirements

### Target Deployment
- Frontend: Vercel
- Backend: Render
- AI Service: Railway
- Database: MongoDB Atlas

### Environment Variables
- Frontend:
  - API base URL
  - socket URL
- Backend:
  - `PORT`
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `AI_SERVICE_URL`
- AI Service:
  - `PORT`
  - data paths
  - model paths
  - environment mode

## 16. Suggested Repository Structure

```text
PlayerIQ/
  PRD.md
  frontend/
  backend/
  ai-service/
  data/
  docs/
  scripts/
```

## 17. Technical Design Guidance For V1

### Frontend
- React with a clear feature-based folder structure
- Recharts or Chart.js for analytics visualizations
- Protected routes for authenticated pages
- Context or lightweight state management for auth and live updates

### Backend
- Express app split into routes, controllers, services, middleware, and models
- Mongoose for MongoDB integration
- Dedicated client for FastAPI service communication
- Socket server for live simulation updates

### AI Service
- FastAPI app organized into:
  - routers
  - services
  - schemas
  - models
  - pipelines
  - utilities
- Pandas and NumPy for processing
- Scikit-learn for clustering and preprocessing

## 18. Phased Delivery Plan

### Phase 1 - Foundation
- Project scaffolding
- Auth flows
- Database setup
- Basic event ingestion
- Base frontend pages
- Initial AI endpoints

### Phase 2 - Core Analytics
- Attribute engine
- Overall rating engine
- PPI engine
- Playstyle clustering
- Player profile page

### Phase 3 - Advanced Insights
- Pressure model
- Comparison engine
- Turning point detection
- AI summary generation

### Phase 4 - Real-Time Experience
- Match simulation pipeline
- WebSocket updates
- Live dashboard refresh

### Phase 5 - Production Hardening
- Error handling
- caching
- deployment configuration
- monitoring and documentation

## 19. Risks And Mitigations

### Risk: Incomplete Or Inconsistent Open Data
Mitigation: Build a normalization layer with fallback defaults and schema validation.

### Risk: Ratings Feel Arbitrary
Mitigation: Make formulas transparent, configurable, and test against known football intuition.

### Risk: Live Recalculation Is Too Heavy
Mitigation: Use incremental aggregates and lightweight recomputation instead of full recompute per event.

### Risk: Cluster Labels Are Hard To Interpret
Mitigation: Use centroid inspection, feature importance summaries, and manual mapping for initial labels.

### Risk: Pressure Definition Is Oversimplified
Mitigation: Keep rules configurable so future versions can add competition context, game state, or possession context.

## 20. Acceptance Criteria For V1

- A user can register and log in using JWT-protected flows
- A user can load player data from ingested event datasets
- A player profile returns:
  - overall rating
  - six attribute ratings
  - playstyle classification
  - PPI
  - pressure index
  - AI-generated report
- Two players can be compared visually and numerically
- A selected match can run in simulated live mode with dynamic metric updates
- Turning points are displayed on a match timeline
- Services can run independently and communicate over defined APIs

## 21. Open Design Decisions

- Whether to use raw template-based summaries in V1 or connect to an LLM-backed summarization layer
- Whether live simulation should be driven by the Node backend or directly by the AI service
- Whether to persist every simulation update or only checkpoints and final summaries
- Whether to add position-aware weighting in the first rating engine release

## 22. Build Recommendation

Start implementation with a monorepo structure containing:
- `frontend` for React
- `backend` for Express + MongoDB + auth
- `ai-service` for FastAPI + ML pipelines

Build the data contracts first, then implement:
1. dataset normalization
2. player feature engineering
3. rating and PPI engines
4. backend-to-AI integration
5. frontend dashboard and profile screens
6. real-time simulation layer

This sequence minimizes integration risk and keeps the analytics logic testable from the beginning.
