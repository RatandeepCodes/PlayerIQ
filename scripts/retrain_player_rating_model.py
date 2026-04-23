import json
import sys
from datetime import datetime, timezone
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
AI_SERVICE_ROOT = REPO_ROOT / "ai-service"
if str(AI_SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(AI_SERVICE_ROOT))

from app.core.config import settings  # noqa: E402
from app.services.feature_engineering import get_player_training_dataset, get_player_training_dataset_metadata  # noqa: E402
from app.services.model_training import retrain_and_persist_player_rating_model  # noqa: E402


def main() -> None:
    output_dir = settings.data_path / "processed"
    output_dir.mkdir(parents=True, exist_ok=True)

    dataset = get_player_training_dataset()
    metadata = get_player_training_dataset_metadata()

    dataset_path = output_dir / "player_rating_training_dataset.csv"
    metadata_path = output_dir / "player_rating_training_metadata.json"
    summary_path = output_dir / "player_rating_retraining_summary.json"

    dataset.to_csv(dataset_path, index=False)
    metadata.update(
        {
            "dataset_path": str(dataset_path),
            "metadata_path": str(metadata_path),
        }
    )
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    retraining = retrain_and_persist_player_rating_model(dataset=dataset)
    summary = {
        "ran_at_utc": datetime.now(timezone.utc).isoformat(),
        "dataset": {
            "row_count": int(len(dataset)),
            "dataset_path": str(dataset_path),
            "metadata_path": str(metadata_path),
        },
        **retraining,
    }
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print(f"Retrained model with {len(dataset)} rows")
    print(f"Saved model to {retraining['artifacts']['model_path']}")
    print(f"Saved metadata to {retraining['artifacts']['metadata_path']}")
    if retraining["archive"]["created"]:
        print(f"Archived previous model to {retraining['archive']['archive_model_path']}")
        print(f"Archived previous metadata to {retraining['archive']['archive_metadata_path']}")
    print(f"Wrote retraining summary to {summary_path}")


if __name__ == "__main__":
    main()
