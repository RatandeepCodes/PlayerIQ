import pandas as pd

from app.schemas.analytics import TurningPoint, TurningPointResponse
from app.services.data_repository import get_match_events


def _minute_intensity(frame: pd.DataFrame) -> float:
    shots = int(frame["event_type"].eq("shot").sum())
    key_passes = int(frame["is_key_pass"].sum())
    tackles = int((frame["event_type"].eq("tackle") & frame["outcome"].eq("success")).sum())
    interceptions = int(frame["event_type"].eq("interception").sum())
    dribbles = int(frame["dribble_success"].sum())
    xg_total = float(frame["xg"].sum())
    return shots * 4.0 + key_passes * 2.5 + tackles * 1.8 + interceptions * 1.6 + dribbles * 1.4 + xg_total * 12.0


def _build_note(frame: pd.DataFrame) -> str:
    dominant_type = frame["event_type"].value_counts().idxmax()
    notes = {
        "shot": "Shot volume spike changed the match tempo",
        "pass": "Circulation and chance creation tilted momentum",
        "dribble": "Repeated 1v1 actions opened the game state",
        "tackle": "Defensive duel wins triggered a momentum swing",
        "interception": "Interceptions created transition pressure",
        "clearance": "Sustained defensive resistance reset momentum",
        "recovery": "Ball recoveries shifted territorial control",
    }
    return notes.get(dominant_type, "Momentum moved through a concentrated event burst")


def detect_turning_points(match_id: str) -> TurningPointResponse:
    events = get_match_events(match_id)
    records = []
    for (minute, team), frame in events.groupby(["minute", "team"]):
        records.append(
            {
                "minute": int(minute),
                "team": str(team),
                "intensity": round(_minute_intensity(frame)),
                "note": _build_note(frame),
            }
        )

    timeline = pd.DataFrame.from_records(records).sort_values(["intensity", "minute"], ascending=[False, True])
    top_points = timeline.head(3).sort_values("minute")

    return TurningPointResponse(
        match_id=match_id,
        turning_points=[
            TurningPoint(
                minute=int(row.minute),
                intensity=int(row.intensity),
                team=str(row.team),
                note=str(row.note),
            )
            for row in top_points.itertuples(index=False)
        ],
    )
