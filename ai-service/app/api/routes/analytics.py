from fastapi import APIRouter, HTTPException

from app.schemas.analytics import (
    CompareResponse,
    DatasetSummaryResponse,
    MatchMomentumResponse,
    PlaystyleResponse,
    PlayerListResponse,
    PressureResponse,
    RatingResponse,
    ReportResponse,
    SimulationResponse,
    TurningPointResponse,
)
from app.services.data_repository import get_dataset_summary, list_players
from app.services.comparison_engine import compare_players
from app.services.momentum_engine import get_match_momentum
from app.services.playstyle_engine import get_playstyle_profile
from app.services.pressure_engine import get_pressure_profile
from app.services.rating_engine import get_player_rating
from app.services.report_generator import generate_player_summary
from app.services.realtime_simulator import simulate_match
from app.services.turning_points import detect_turning_points

router = APIRouter()


@router.get("/dataset/summary", response_model=DatasetSummaryResponse)
def dataset_summary() -> DatasetSummaryResponse:
    return get_dataset_summary()


@router.get("/players", response_model=PlayerListResponse)
def players() -> PlayerListResponse:
    return list_players()


@router.get("/rating/{player_id}", response_model=RatingResponse)
def rating(player_id: str) -> RatingResponse:
    try:
        return get_player_rating(player_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=error.args[0]) from error


@router.get("/playstyle/{player_id}", response_model=PlaystyleResponse)
def playstyle(player_id: str) -> PlaystyleResponse:
    try:
        return get_playstyle_profile(player_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=error.args[0]) from error


@router.get("/pressure/{player_id}", response_model=PressureResponse)
def pressure(player_id: str) -> PressureResponse:
    try:
        return get_pressure_profile(player_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=error.args[0]) from error


@router.get("/compare/{player1}/{player2}", response_model=CompareResponse)
def compare(player1: str, player2: str) -> CompareResponse:
    try:
        return compare_players(player1, player2)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=error.args[0]) from error


@router.get("/report/{player_id}", response_model=ReportResponse)
def report(player_id: str) -> ReportResponse:
    try:
        return generate_player_summary(player_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=error.args[0]) from error


@router.post("/simulate/match/{match_id}", response_model=SimulationResponse)
def simulate(match_id: str) -> SimulationResponse:
    try:
        return simulate_match(match_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=error.args[0]) from error


@router.get("/match/{match_id}/momentum", response_model=MatchMomentumResponse)
def momentum(match_id: str) -> MatchMomentumResponse:
    try:
        return get_match_momentum(match_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=error.args[0]) from error


@router.get("/match/{match_id}/turning-points", response_model=TurningPointResponse)
def turning_points(match_id: str) -> TurningPointResponse:
    try:
        return detect_turning_points(match_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=error.args[0]) from error
