# PlayerIQ ML And Live Data Expansion Plan

## Purpose

This document explains how PlayerIQ should evolve from its current event-driven analytics engine into a platform that also supports:

- trained machine learning models
- scheduled historical data refresh
- live fixture and score ingestion
- repeatable model retraining

This is an implementation roadmap, not a claim that the entire stack is already complete.

## Current State

PlayerIQ already includes:

- normalized football event ingestion
- player feature engineering
- rule-based overall rating logic
- attribute scoring
- clustering-based playstyle logic
- pressure scoring
- comparison logic
- turning point and momentum logic
- AI-style summary/report generation

What PlayerIQ does not yet fully include:

- a persisted supervised model artifact for player rating
- an automated retraining pipeline
- automatic live football API ingestion
- automatic conversion of upcoming fixtures into completed event-backed analytics

## Recommended Evolution Path

## 1. Keep The Current Engine As Baseline

Do not remove the current rules-and-features system.

Use it as:

- the current working product logic
- fallback behavior if a trained model is missing
- an explainability layer around model predictions

This reduces risk and keeps the product usable while the ML pipeline is introduced.

## 2. Build A Training Dataset

Create a training dataset from normalized event data.

Recommended row shapes:

- one row per player-match
- one row per player recent-form window
- one row per player season aggregate

Recommended features:

- passes completed
- pass accuracy
- key passes
- progressive passes
- shots
- shots on target
- goals
- xG
- dribbles attempted
- dribbles completed
- tackles
- interceptions
- clearances
- recoveries
- defensive actions
- pressure actions
- success rate

Recommended first target:

- `overall_rating`

This target is the easiest way to convert the current rating engine into a proper supervised ML problem.

## 3. Train The First Supervised Model

Start with one model only:

- player overall rating prediction

Recommended first models:

- RandomForestRegressor
- GradientBoostingRegressor

Possible later upgrades:

- XGBoost
- LightGBM

Training workflow:

1. export features and labels
2. split train and validation data
3. train model
4. evaluate model quality
5. save model artifact
6. save feature column order
7. save evaluation metrics

Example artifact outputs:

- `ai-service/models/player_rating_model.pkl`
- `ai-service/models/player_rating_features.json`
- `ai-service/models/player_rating_metrics.json`

## 4. Add Model Inference To The AI Service

After training:

- load the saved model inside the FastAPI AI service
- compute the same feature vector used during training
- run model prediction during player profile generation

Recommended behavior:

- if model is available, use model prediction for rating
- if model is unavailable, fall back to existing rule-based rating logic

This gives PlayerIQ a safe migration path.

## 5. Keep Playstyle And Pressure As Hybrid Logic

Near term:

- keep clustering for playstyle
- keep rule-based pressure logic

Later:

- add supervised playstyle classification if labeled data becomes available
- add pressure-performance classification if enough historical examples exist

## 6. Separate Historical Data From Live Data

This is critical.

### Historical Data

Use for:

- training
- completed-match analytics
- player profile generation
- momentum and turning-point analysis

Good sources:

- StatsBomb Open Data
- Kaggle football datasets

### Live Data

Use for:

- upcoming fixtures
- match status
- score updates
- kickoff times

Good sources:

- football-data.org
- Sportmonks
- Hudl StatsBomb Live or another licensed live feed

Important:

- Kaggle is not a live feed
- StatsBomb Open Data is not a live feed

### Selected First Provider

For the first live-data integration milestone, PlayerIQ should use:

- `football-data.org`

Reason:

- it fits the current project best for fixtures, statuses, and score updates
- it is a simpler first integration than a larger premium provider
- the project already references `FOOTBALL_DATA_API_TOKEN` in backend configuration

## 7. Build Scheduled Data Refresh Jobs

Recommended jobs:

- `scripts/import_statsbomb_open_data.py`
- `scripts/import_kaggle_snapshots.py`
- `scripts/sync_live_fixtures.py`
- `scripts/retrain_player_rating_model.py`

Recommended schedule:

- historical snapshot refresh: daily or manual
- fixtures refresh: every 6 to 12 hours
- active match status refresh: every 15 to 60 seconds during match windows
- model retraining: weekly or monthly

## 8. Define Match-State Rules Clearly

PlayerIQ should treat match states in this order:

- `upcoming`
- `live`
- `completed`

Important business rule:

- a match becoming `completed` in a live fixture API does not automatically mean PlayerIQ has full analytics for it
- full match analysis should only be enabled once event-level data is available and normalized

This prevents false analytics on matches where only score/status data exists.

## 9. What “Auto Generate Data” Should Mean

In PlayerIQ, “auto generate data” should mean:

- automatically sync fixture and score metadata from approved APIs
- automatically import historical datasets from approved sources
- automatically recompute features from imported events
- automatically retrain models on schedule

It should not mean:

- scraping random websites with unstable HTML
- inventing event data for matches without a real data source

## 10. Recommended Folder Responsibilities

### Existing folders

- `ai-service/app/services/feature_engineering.py`
  - reusable feature computation for both training and inference
- `ai-service/app/services/rating_engine.py`
  - should become the wrapper around trained model inference plus fallback
- `ai-service/app/services/data_repository.py`
  - ingestion access layer

### Recommended additions

- `ai-service/models/`
  - saved model artifacts
- `scripts/retrain_player_rating_model.py`
  - first supervised training entry point
- `scripts/sync_live_fixtures.py`
  - fixture/status refresh job
- `data/processed/`
  - exported training datasets

## 11. Recommended Delivery Order

### Step 1

Build training dataset export from the current normalized events.

### Step 2

Train the first player rating model.

### Step 3

Serve that model through the AI service with safe fallback.

### Step 4

Add one live football API for fixtures and status.

### Step 5

Add scheduled retraining and data refresh scripts.

### Step 6

Expand into playstyle classification and richer ML later.

## 12. Practical Outcome

After this roadmap is implemented, PlayerIQ will be able to honestly claim:

- event-driven football analytics
- machine-learning-assisted player ratings
- scheduled historical data refresh
- live fixture and score ingestion
- explainable AI outputs built on both engineered features and trained models

Until then, the current product should be described accurately as:

- an AI-driven football analytics platform with feature engineering, rules-based scoring, clustering, and report generation, designed to be extended into a full supervised ML and live-data pipeline
