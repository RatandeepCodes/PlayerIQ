from app.schemas.analytics import AttributeScores, RatingResponse
from app.services.feature_engineering import get_player_features


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
        overall_rating=int(player["overall_rating"]),
        ppi=int(player["ppi"]),
        matches_analyzed=int(player["matches_played"]),
        sources=list(player["sources"]),
        attributes=attributes,
    )
