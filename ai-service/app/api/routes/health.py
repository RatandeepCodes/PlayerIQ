from fastapi import APIRouter

from app.services.data_repository import get_dataset_health

router = APIRouter()


@router.get("/health")
def healthcheck() -> dict:
    dataset_health = get_dataset_health()
    return {
        "status": dataset_health["status"],
        "service": "playeriq-ai-service",
        "dataset": dataset_health["dataset"],
        "sources": dataset_health["sources"],
        "warnings": dataset_health["warnings"],
    }
