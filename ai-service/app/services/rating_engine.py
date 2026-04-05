from functools import lru_cache

from app.schemas.analytics import AttributeScores, RatingResponse
from app.services.feature_engineering import get_player_features
from app.services.model_training import load_player_rating_model, predict_player_rating_from_features

MIN_RATING = 0
MAX_RATING = 100


@lru_cache(maxsize=1)
def _load_rating_model_for_inference():
    return load_player_rating_model()


def _clip_rating(value: float | int) -> int:
    rounded = int(round(float(value)))
    return max(MIN_RATING, min(MAX_RATING, rounded))


def _blend_model_rating(prediction: float, heuristic_rating: int, matches_played: int) -> int:
    predicted_rating = _clip_rating(prediction)
    if matches_played < 3:
        return max(heuristic_rating, predicted_rating)

    model_weight = matches_played / (matches_played + 4)
    model_weight = max(0.35, min(0.75, model_weight))
    blended = (prediction * model_weight) + (heuristic_rating * (1.0 - model_weight))
    return _clip_rating(blended)


def _resolve_overall_rating(player_features: dict) -> int:
    heuristic_rating = _clip_rating(player_features["overall_rating"])
    try:
        model, metadata = _load_rating_model_for_inference()
        feature_columns = metadata.get("feature_columns") or []
        if not feature_columns:
            return heuristic_rating

        prediction = predict_player_rating_from_features(player_features, model=model)
        return _blend_model_rating(prediction, heuristic_rating, int(player_features["matches_played"]))
    except Exception:
        return heuristic_rating


def get_player_rating(player_id: str) -> RatingResponse:
    player = get_player_features(player_id)

    attributes = AttributeScores(
        shooting=int(player["shooting_score"]),
        passing=int(player["passing_score"]),
        dribbling=int(player["dribbling_score"]),
        defending=int(player["defending_score"]),
        creativity=int(player["creativity_score"]),
        physical=int(player["physical_score"]),
    )

    return RatingResponse(
        player_id=player["player_id"],
        player_name=player["player_name"],
        team=player["team"],
        nationality=player["nationality"],
        position=player["position"],
        overall_rating=_resolve_overall_rating(player),
        ppi=int(player["ppi"]),
        matches_analyzed=int(player["matches_played"]),
        sources=list(player["sources"]),
        attributes=attributes,
    )
