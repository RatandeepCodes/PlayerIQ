from app.schemas.analytics import TurningPoint, TurningPointResponse


def detect_turning_points(match_id: str) -> TurningPointResponse:
    return TurningPointResponse(
        match_id=match_id,
        turning_points=[
            TurningPoint(minute=14, intensity=52, team="Northbridge FC", note="Sustained possession wave"),
            TurningPoint(minute=39, intensity=73, team="Eastbay United", note="Transition-heavy xG burst"),
            TurningPoint(minute=76, intensity=88, team="Northbridge FC", note="Late pressing regain sequence"),
        ],
    )

