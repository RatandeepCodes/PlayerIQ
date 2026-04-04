import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
AI_SERVICE_ROOT = REPO_ROOT / "ai-service"
if str(AI_SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(AI_SERVICE_ROOT))

from app.services.model_training import train_and_persist_player_rating_model  # noqa: E402


def main() -> None:
    artifacts = train_and_persist_player_rating_model()
    print(f"Saved model to {artifacts.model_path}")
    print(f"Saved metadata to {artifacts.metadata_path}")
    print(f"Rows used: {artifacts.row_count}")
    print(f"Metrics: {artifacts.metrics}")


if __name__ == "__main__":
    main()
