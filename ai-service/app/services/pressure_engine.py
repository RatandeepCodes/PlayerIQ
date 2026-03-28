from app.schemas.analytics import PressureResponse
from app.services.feature_engineering import get_player_features


def get_pressure_profile(player_id: str) -> PressureResponse:
    player = get_player_features(player_id)
    features = player["features"]

    normal_performance = (features["pass_accuracy"] * 50) + (features["key_passes"] * 7)
    pressure_performance = normal_performance * (0.92 + features["xg"])
    pressure_index = round(pressure_performance / normal_performance, 2)
    pressure_score = max(0, min(100, round(pressure_index * 80)))

    interpretation = "Stable output in high-leverage moments"
    if pressure_index > 1.05:
        interpretation = "Improves when match pressure rises"
    elif pressure_index < 0.95:
        interpretation = "Output dips in late close-game situations"

    return PressureResponse(
        player_id=player["player_id"],
        pressure_index=pressure_index,
        pressure_score=pressure_score,
        interpretation=interpretation,
    )
