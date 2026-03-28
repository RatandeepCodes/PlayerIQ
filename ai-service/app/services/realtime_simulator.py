import pandas as pd

from app.schemas.analytics import SimulationResponse, SimulationTick
from app.services.data_repository import get_match_events, get_player_metadata
from app.services.feature_engineering import get_live_feature_snapshot, get_player_feature_table


def simulate_match(match_id: str) -> SimulationResponse:
    events = get_match_events(match_id).sort_values(["minute", "second"]).reset_index(drop=True)
    baseline = get_player_feature_table().set_index("player_id")
    timeline: list[SimulationTick] = []
    live_events = pd.DataFrame(columns=events.columns)

    for _, event in events.iterrows():
        live_events = pd.concat([live_events, pd.DataFrame([event])], ignore_index=True)
        player_id = str(event["player_id"])
        live_snapshot = get_live_feature_snapshot(live_events, player_id)
        baseline_row = baseline.loc[player_id]
        live_rating = round((float(live_snapshot["overall_rating"]) * 0.65) + (float(baseline_row["overall_rating"]) * 0.35))
        live_ppi = round((float(live_snapshot["ppi"]) * 0.7) + (float(baseline_row["ppi"]) * 0.3))
        metadata = get_player_metadata(player_id)

        timeline.append(
            SimulationTick(
                minute=int(event["minute"]),
                second=int(event["second"]),
                player_id=player_id,
                player_name=metadata["player_name"],
                team=str(event["team"]),
                event_type=str(event["event_type"]),
                live_rating=max(0, min(100, live_rating)),
                live_ppi=max(0, min(100, live_ppi)),
            )
        )

    return SimulationResponse(
        match_id=match_id,
        status="ready",
        timeline=timeline,
    )
