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
    low_sample = rating.matches_analyzed < 2

    strengths = [
        f"{playstyle.playstyle} profile backed by {strongest_attribute} strength",
        f"Overall rating of {rating.overall_rating} with PPI at {rating.ppi}",
        pressure.interpretation,
    ]

    development_areas = [
        f"Raise the current {weakest_attribute} baseline",
        "Expand the event sample across more matches for stronger model confidence"
        if low_sample
        else "Keep building a larger event sample to strengthen confidence in the profile",
    ]

    sample_context = (
        "This is still an early read from a light event sample."
        if low_sample
        else "The profile is grounded in a broader event sample."
    )
    pressure_context = (
        "There are not enough pressure events yet for a strong late-game read."
        if pressure.pressure_events == 0
        else f"The current pressure index sits at {pressure.pressure_index}."
    )

    summary = (
        f"{rating.player_name} profiles as a {playstyle.playstyle.lower()} with {strongest_attribute} standing out most clearly. "
        f"The player currently carries an overall rating of {rating.overall_rating} and a PPI of {rating.ppi}. "
        f"{pressure_context} {sample_context} "
        f"The dataset covers {rating.matches_analyzed} match windows across {', '.join(rating.sources)}."
    )

    return ReportResponse(
        player_id=rating.player_id,
        summary=summary,
        strengths=strengths,
        development_areas=development_areas,
    )
