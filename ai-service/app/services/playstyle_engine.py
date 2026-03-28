from app.schemas.analytics import PlaystyleResponse
from app.services.feature_engineering import get_player_features


def get_playstyle_profile(player_id: str) -> PlaystyleResponse:
    player = get_player_features(player_id)
    features = player["features"]

    if features["shots"] >= 3.2:
        playstyle = "Striker"
        traits = ["Direct runner", "High shot volume", "Attacks central zones"]
        distance = 0.21
    elif features["dribbles"] >= 5.5:
        playstyle = "Winger"
        traits = ["1v1 threat", "Wide progression", "Carry-heavy profile"]
        distance = 0.26
    elif features["defensive_actions"] >= 5.0:
        playstyle = "Box-to-box"
        traits = ["Two-way output", "Transition coverage", "High work rate"]
        distance = 0.31
    else:
        playstyle = "Playmaker"
        traits = ["Creative passing", "Ball progression", "Chance creation"]
        distance = 0.19

    return PlaystyleResponse(
        player_id=player["player_id"],
        playstyle=playstyle,
        cluster_distance=distance,
        supporting_traits=traits,
    )

