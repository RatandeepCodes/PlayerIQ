from app.schemas.analytics import ReportResponse
from app.services.playstyle_engine import get_playstyle_profile
from app.services.pressure_engine import get_pressure_profile
from app.services.rating_engine import get_player_rating


def generate_player_summary(player_id: str) -> ReportResponse:
    rating = get_player_rating(player_id)
    playstyle = get_playstyle_profile(player_id)
    pressure = get_pressure_profile(player_id)
    attributes = rating.attributes.model_dump()
    strongest_attribute = max(attributes, key=attributes.get)
    weakest_attribute = min(attributes, key=attributes.get)

    strengths = [
        f"{playstyle.playstyle} profile backed by {strongest_attribute} strength",
        f"Overall rating of {rating.overall_rating} with PPI at {rating.ppi}",
        pressure.interpretation,
    ]

    development_areas = [
        f"Raise the current {weakest_attribute} baseline",
        "Expand the event sample across more matches for stronger model confidence",
    ]

    summary = (
        f"{rating.player_name} profiles as a {playstyle.playstyle.lower()} with a balanced blend of on-ball impact "
        f"and repeatable production. The player currently carries an overall rating of {rating.overall_rating} "
        f"and a pressure index of {pressure.pressure_index}. "
        f"The dataset covers {rating.matches_analyzed} match windows across {', '.join(rating.sources)}."
    )

    return ReportResponse(
        player_id=rating.player_id,
        summary=summary,
        strengths=strengths,
        development_areas=development_areas,
    )
