# Scripts Directory

Place setup helpers, dataset ingestion utilities, and local developer scripts here.

Current utilities:

- `import_statsbomb_open_data.py`
  - refreshes local StatsBomb open-data support files and writes refresh metadata to `data/sources/statsbomb_open_data/refresh_metadata.json`
- `import_kaggle_snapshot.py`
  - refreshes the local Kaggle event snapshot from a CSV or ZIP export and writes refresh metadata to `data/sources/kaggle_indian_players/refresh_metadata.json`
- `sync_live_fixtures.mjs`
  - syncs live, completed, and upcoming fixtures from `football-data.org` into `data/processed/live_fixtures_snapshot.json` plus refresh metadata
- `export_training_dataset.py`
  - exports the first reusable player-rating training dataset to `data/processed/`
- `train_player_rating_model.py`
  - trains and persists the first supervised player-rating model to `ai-service/models/`
- `retrain_player_rating_model.py`
  - re-exports the current training dataset, archives the previous model artifacts, retrains the player-rating model, and writes a retraining summary to `data/processed/player_rating_retraining_summary.json`
