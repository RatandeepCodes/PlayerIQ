from dataclasses import dataclass
import os
from pathlib import Path

SERVICE_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = SERVICE_ROOT.parent


def _resolve_path(raw_value: str, base_path: Path) -> Path:
    candidate = Path(raw_value)
    if candidate.is_absolute():
        return candidate
    return (base_path / candidate).resolve()


@dataclass(frozen=True)
class Settings:
    app_name: str
    app_env: str
    data_path: Path
    model_path: Path


settings = Settings(
    app_name=os.getenv("APP_NAME", "PlayerIQ AI Service"),
    app_env=os.getenv("APP_ENV", "development"),
    data_path=_resolve_path(os.getenv("DATA_PATH", "../data"), SERVICE_ROOT),
    model_path=_resolve_path(os.getenv("MODEL_PATH", "./models"), SERVICE_ROOT),
)
