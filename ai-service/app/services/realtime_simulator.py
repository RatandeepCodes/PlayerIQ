from app.schemas.analytics import SimulationResponse, SimulationTick


def simulate_match(match_id: str) -> SimulationResponse:
    timeline = [
        SimulationTick(minute=5, player_id="10", live_rating=72, live_ppi=69),
        SimulationTick(minute=18, player_id="10", live_rating=75, live_ppi=74),
        SimulationTick(minute=44, player_id="7", live_rating=77, live_ppi=76),
        SimulationTick(minute=81, player_id="10", live_rating=82, live_ppi=84),
    ]

    return SimulationResponse(
        match_id=match_id,
        status="ready",
        timeline=timeline,
    )

