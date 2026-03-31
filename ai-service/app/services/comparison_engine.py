from app.schemas.analytics import CompareResponse, RadarPoint
from app.services.playstyle_engine import get_playstyle_profile
from app.services.pressure_engine import get_pressure_profile
from app.services.rating_engine import get_player_rating


def compare_players(player1: str, player2: str) -> CompareResponse:
    left = get_player_rating(player1)
    right = get_player_rating(player2)
    left_playstyle = get_playstyle_profile(player1)
    right_playstyle = get_playstyle_profile(player2)
    left_pressure = get_pressure_profile(player1)
    right_pressure = get_pressure_profile(player2)

    left_score = left.overall_rating + left.ppi
    right_score = right.overall_rating + right.ppi
    if left_score == right_score:
        winner = None
        opening = "The comparison is level on the combined rating and performance profile."
    else:
        winner = left.player_name if left_score > right_score else right.player_name
        opening = f"{winner} edges the comparison through the stronger combined rating and performance profile."

    radar = [
        RadarPoint(metric="Shooting", player_one=left.attributes.shooting, player_two=right.attributes.shooting),
        RadarPoint(metric="Passing", player_one=left.attributes.passing, player_two=right.attributes.passing),
        RadarPoint(metric="Dribbling", player_one=left.attributes.dribbling, player_two=right.attributes.dribbling),
        RadarPoint(metric="Defending", player_one=left.attributes.defending, player_two=right.attributes.defending),
        RadarPoint(metric="Creativity", player_one=left.attributes.creativity, player_two=right.attributes.creativity),
        RadarPoint(metric="Physical", player_one=left.attributes.physical, player_two=right.attributes.physical),
    ]

    summary = (
        f"{opening} "
        f"{left.player_name} profiles as a {left_playstyle.playstyle.lower()}, while "
        f"{right.player_name} leans toward a {right_playstyle.playstyle.lower()} role. "
        f"Pressure impact reads {left_pressure.pressure_index:.2f} versus {right_pressure.pressure_index:.2f}."
    )

    return CompareResponse(
        player_one=left.player_name,
        player_two=right.player_name,
        winner=winner,
        summary=summary,
        radar=radar,
    )
