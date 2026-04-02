from app.schemas.analytics import PressureResponse
from app.services.feature_engineering import get_player_features


def get_pressure_profile(player_id: str) -> PressureResponse:
    player = get_player_features(player_id)

    pressure_events = int(player["pressure_events"])

    interpretation = "Stable output in high-leverage moments"
    if pressure_events == 0:
        interpretation = "Not enough late close-game moments yet to judge pressure performance reliably"
    elif player["pressure_index"] > 1.05:
        interpretation = "Improves when match pressure rises"
    elif player["pressure_index"] < 0.95:
        interpretation = "Output dips in late close-game situations"

    return PressureResponse(
        player_id=player["player_id"],
        pressure_index=float(player["pressure_index"]),
        pressure_score=int(player["pressure_score"]),
        pressure_events=pressure_events,
        interpretation=interpretation,
    )
