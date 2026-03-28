from statistics import mean

from app.schemas.analytics import AttributeScores, RatingResponse
from app.services.feature_engineering import get_player_features


def _clamp(score: float) -> int:
    return max(0, min(100, round(score)))


def get_player_rating(player_id: str) -> RatingResponse:
    player = get_player_features(player_id)
    features = player["features"]

    attributes = AttributeScores(
        shooting=_clamp(features["shots"] * 18 + features["xg"] * 80),
        passing=_clamp(features["pass_accuracy"] * 75 + features["key_passes"] * 8),
        dribbling=_clamp(features["dribbles"] * 12 + 18),
        defending=_clamp(features["defensive_actions"] * 12 + 8),
        creativity=_clamp(features["key_passes"] * 16 + features["pass_accuracy"] * 25),
        physical=_clamp(features["defensive_actions"] * 10 + features["dribbles"] * 4 + 10),
    )

    overall_rating = _clamp(mean(attributes.model_dump().values()))
    ppi = _clamp(overall_rating * 0.92 + features["xg"] * 18)

    return RatingResponse(
        player_id=player["player_id"],
        player_name=player["player_name"],
        team=player["team"],
        position=player["position"],
        overall_rating=overall_rating,
        ppi=ppi,
        attributes=attributes,
    )

