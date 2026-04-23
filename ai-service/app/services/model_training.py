import json
import pickle
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
import shutil

import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

from app.core.config import settings
from app.services.feature_engineering import (
    TRAINING_FEATURE_COLUMNS,
    get_player_training_dataset,
    get_player_training_dataset_metadata,
)

MODEL_VERSION = "player_rating_rf_v1"
MODEL_FILENAME = "player_rating_model.pkl"
MODEL_METADATA_FILENAME = "player_rating_model_metadata.json"
DEFAULT_TARGET_COLUMN = "overall_rating"


@dataclass(frozen=True)
class TrainingArtifacts:
    model_path: Path
    metadata_path: Path
    metrics: dict
    feature_columns: list[str]
    target_column: str
    row_count: int
    model_version: str


def serialize_training_artifacts(artifacts: TrainingArtifacts) -> dict:
    payload = asdict(artifacts)
    payload["model_path"] = str(artifacts.model_path)
    payload["metadata_path"] = str(artifacts.metadata_path)
    return payload


def _get_model_dir() -> Path:
    model_dir = settings.model_path
    model_dir.mkdir(parents=True, exist_ok=True)
    return model_dir


def _get_model_archive_dir() -> Path:
    archive_dir = _get_model_dir() / "archive"
    archive_dir.mkdir(parents=True, exist_ok=True)
    return archive_dir


def get_rating_model_paths() -> tuple[Path, Path]:
    model_dir = _get_model_dir()
    return model_dir / MODEL_FILENAME, model_dir / MODEL_METADATA_FILENAME


def train_player_rating_model(
    dataset: pd.DataFrame | None = None,
    target_column: str = DEFAULT_TARGET_COLUMN,
) -> tuple[RandomForestRegressor, TrainingArtifacts]:
    training_frame = dataset.copy() if dataset is not None else get_player_training_dataset()
    if training_frame.empty:
        raise RuntimeError("Training dataset is empty")
    if target_column not in training_frame.columns:
        raise KeyError(f"Target column '{target_column}' not found in training dataset")

    feature_frame = training_frame[TRAINING_FEATURE_COLUMNS].copy()
    target = training_frame[target_column].astype(float)

    x_train, x_test, y_train, y_test = train_test_split(
        feature_frame,
        target,
        test_size=0.25,
        random_state=42,
    )

    model = RandomForestRegressor(
        n_estimators=240,
        random_state=42,
        min_samples_leaf=1,
        n_jobs=1,
    )
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)

    metrics = {
        "mae": round(float(mean_absolute_error(y_test, predictions)), 4),
        "rmse": round(float(mean_squared_error(y_test, predictions) ** 0.5), 4),
        "r2": round(float(r2_score(y_test, predictions)), 4),
        "train_rows": int(len(x_train)),
        "test_rows": int(len(x_test)),
    }

    model_path, metadata_path = get_rating_model_paths()
    artifacts = TrainingArtifacts(
        model_path=model_path,
        metadata_path=metadata_path,
        metrics=metrics,
        feature_columns=list(TRAINING_FEATURE_COLUMNS),
        target_column=target_column,
        row_count=int(len(training_frame)),
        model_version=MODEL_VERSION,
    )
    return model, artifacts


def persist_player_rating_model(
    model: RandomForestRegressor,
    artifacts: TrainingArtifacts,
    dataset_metadata: dict | None = None,
) -> TrainingArtifacts:
    payload = {
        "model_version": artifacts.model_version,
        "feature_columns": artifacts.feature_columns,
        "target_column": artifacts.target_column,
        "row_count": artifacts.row_count,
        "metrics": artifacts.metrics,
        "dataset": dataset_metadata or get_player_training_dataset_metadata(),
    }

    with artifacts.model_path.open("wb") as handle:
        pickle.dump(model, handle)

    artifacts.metadata_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return artifacts


def load_player_rating_model() -> tuple[RandomForestRegressor, dict]:
    model_path, metadata_path = get_rating_model_paths()
    if not model_path.exists() or not metadata_path.exists():
        raise FileNotFoundError("Persisted player rating model artifacts are missing")

    with model_path.open("rb") as handle:
        model = pickle.load(handle)
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    return model, metadata


def train_and_persist_player_rating_model(
    dataset: pd.DataFrame | None = None,
    target_column: str = DEFAULT_TARGET_COLUMN,
) -> TrainingArtifacts:
    model, artifacts = train_player_rating_model(dataset=dataset, target_column=target_column)
    dataset_metadata = get_player_training_dataset_metadata()
    return persist_player_rating_model(model, artifacts, dataset_metadata=dataset_metadata)


def archive_existing_rating_model() -> dict:
    model_path, metadata_path = get_rating_model_paths()
    if not model_path.exists() or not metadata_path.exists():
        return {
            "created": False,
            "reason": "missing_current_artifacts",
            "archive_model_path": None,
            "archive_metadata_path": None,
        }

    archive_dir = _get_model_archive_dir()
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    archive_model_path = archive_dir / f"player_rating_model_{timestamp}.pkl"
    archive_metadata_path = archive_dir / f"player_rating_model_metadata_{timestamp}.json"

    shutil.copy2(model_path, archive_model_path)
    shutil.copy2(metadata_path, archive_metadata_path)

    return {
        "created": True,
        "reason": None,
        "archive_model_path": str(archive_model_path),
        "archive_metadata_path": str(archive_metadata_path),
    }


def retrain_and_persist_player_rating_model(
    dataset: pd.DataFrame | None = None,
    target_column: str = DEFAULT_TARGET_COLUMN,
    archive_existing: bool = True,
) -> dict:
    archive_summary = archive_existing_rating_model() if archive_existing else {
        "created": False,
        "reason": "archiving_disabled",
        "archive_model_path": None,
        "archive_metadata_path": None,
    }
    artifacts = train_and_persist_player_rating_model(dataset=dataset, target_column=target_column)
    return {
        "archive": archive_summary,
        "artifacts": serialize_training_artifacts(artifacts),
    }


def predict_player_rating_from_features(feature_row: dict | pd.Series, model: RandomForestRegressor | None = None) -> float:
    active_model = model
    if active_model is None:
        active_model, _ = load_player_rating_model()

    frame = pd.DataFrame([[feature_row[column] for column in TRAINING_FEATURE_COLUMNS]], columns=TRAINING_FEATURE_COLUMNS)
    prediction = active_model.predict(frame)[0]
    return float(prediction)


def get_training_artifact_summary() -> dict:
    model_path, metadata_path = get_rating_model_paths()
    summary = {
        "model_path": str(model_path),
        "metadata_path": str(metadata_path),
        "exists": model_path.exists() and metadata_path.exists(),
    }
    if summary["exists"]:
        _, metadata = load_player_rating_model()
        summary["metadata"] = metadata
    return summary
