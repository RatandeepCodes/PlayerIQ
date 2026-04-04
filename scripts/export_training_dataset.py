import json
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
AI_SERVICE_ROOT = REPO_ROOT / "ai-service"
if str(AI_SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(AI_SERVICE_ROOT))

from app.core.config import settings  # noqa: E402
from app.services.feature_engineering import (  # noqa: E402
    get_player_training_dataset,
    get_player_training_dataset_metadata,
)


def main() -> None:
    output_dir = settings.data_path / "processed"
    output_dir.mkdir(parents=True, exist_ok=True)

    dataset = get_player_training_dataset()
    metadata = get_player_training_dataset_metadata()

    dataset_path = output_dir / "player_rating_training_dataset.csv"
    metadata_path = output_dir / "player_rating_training_metadata.json"

    dataset.to_csv(dataset_path, index=False)
    metadata.update(
        {
            "dataset_path": str(dataset_path),
            "metadata_path": str(metadata_path),
        }
    )
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    print(f"Exported {len(dataset)} rows to {dataset_path}")
    print(f"Wrote metadata to {metadata_path}")


if __name__ == "__main__":
    main()
