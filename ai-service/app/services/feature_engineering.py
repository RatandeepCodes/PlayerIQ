from app.services.sample_data import SAMPLE_PLAYERS


def get_player_features(player_id: str) -> dict:
    player = SAMPLE_PLAYERS.get(player_id)
    if player:
        return player

    return {
        "player_id": player_id,
        "player_name": "Sample Prospect",
        "team": "PlayerIQ XI",
        "position": "CM",
        "features": {
            "pass_accuracy": 0.82,
            "key_passes": 2.8,
            "shots": 2.0,
            "defensive_actions": 5.3,
            "dribbles": 3.8,
            "xg": 0.21,
        },
    }

