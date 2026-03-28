from fastapi import APIRouter

from app.schemas.analytics import (
    CompareResponse,
    PlaystyleResponse,
    PressureResponse,
    RatingResponse,
    ReportResponse,
    SimulationResponse,
    TurningPointResponse,
)
from app.services.comparison_engine import compare_players
from app.services.playstyle_engine import get_playstyle_profile
from app.services.pressure_engine import get_pressure_profile
from app.services.rating_engine import get_player_rating
from app.services.report_generator import generate_player_summary
from app.services.realtime_simulator import simulate_match
from app.services.turning_points import detect_turning_points

router = APIRouter()


@router.get("/rating/{player_id}", response_model=RatingResponse)
def rating(player_id: str) -> RatingResponse:
    return get_player_rating(player_id)


@router.get("/playstyle/{player_id}", response_model=PlaystyleResponse)
def playstyle(player_id: str) -> PlaystyleResponse:
    return get_playstyle_profile(player_id)


@router.get("/pressure/{player_id}", response_model=PressureResponse)
def pressure(player_id: str) -> PressureResponse:
    return get_pressure_profile(player_id)


@router.get("/compare/{player1}/{player2}", response_model=CompareResponse)
def compare(player1: str, player2: str) -> CompareResponse:
    return compare_players(player1, player2)


@router.get("/report/{player_id}", response_model=ReportResponse)
def report(player_id: str) -> ReportResponse:
    return generate_player_summary(player_id)


@router.post("/simulate/match/{match_id}", response_model=SimulationResponse)
def simulate(match_id: str) -> SimulationResponse:
    return simulate_match(match_id)


@router.get("/match/{match_id}/turning-points", response_model=TurningPointResponse)
def turning_points(match_id: str) -> TurningPointResponse:
    return detect_turning_points(match_id)

