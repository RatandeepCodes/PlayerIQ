from __future__ import annotations

import pandas as pd

from app.schemas.analytics import MatchMomentumResponse, MomentumBucket, TeamMomentumScore
from app.services.data_repository import get_match_events

BUCKET_SIZE_MINUTES = 5


def _event_weight(frame: pd.DataFrame) -> float:
    shots = int(frame["event_type"].eq("shot").sum())
    xg_total = float(frame["xg"].sum())
    key_passes = int(frame["is_key_pass"].sum())
    progressive_passes = int(frame["progressive_pass"].sum())
    dribbles = int(frame["dribble_success"].sum())
    tackles = int((frame["event_type"].eq("tackle") & frame["outcome"].eq("success")).sum())
    interceptions = int(frame["event_type"].eq("interception").sum())
    recoveries = int(frame["event_type"].eq("recovery").sum())

    return round(
        shots * 4.0
        + xg_total * 12.0
        + key_passes * 3.0
        + progressive_passes * 2.0
        + dribbles * 2.0
        + tackles * 1.5
        + interceptions * 1.5
        + recoveries * 1.0,
        2,
    )


def _bucket_label(start_minute: int, end_minute: int) -> str:
    return f"{start_minute}-{end_minute}"


def _bucket_note(leader: str | None, swing: bool, swing_magnitude: float) -> str | None:
    if leader is None:
        return "Balanced spell with no clear territorial leader"
    if swing and swing_magnitude >= 4:
        return f"Strong momentum swing toward {leader}"
    if swing:
        return f"Momentum edges toward {leader}"
    if swing_magnitude >= 5:
        return f"{leader} controlled this phase"
    return None


def get_match_momentum(match_id: str) -> MatchMomentumResponse:
    events = get_match_events(match_id)
    teams = sorted(set(events["team"].unique().tolist()) | set(events["opponent"].unique().tolist()))
    if not teams:
        raise KeyError(f"Match '{match_id}' not found in event dataset")

    max_minute = int(events["minute"].max())
    bucket_starts = list(range(0, ((max_minute // BUCKET_SIZE_MINUTES) + 1) * BUCKET_SIZE_MINUTES, BUCKET_SIZE_MINUTES))
    buckets: list[MomentumBucket] = []
    previous_leader: str | None = None
    previous_margin = 0.0

    for bucket_start in bucket_starts:
        bucket_end = min(bucket_start + BUCKET_SIZE_MINUTES - 1, 95)
        bucket_events = events.loc[(events["minute"] >= bucket_start) & (events["minute"] <= bucket_end)]
        team_scores = []
        for team in teams:
            score = _event_weight(bucket_events.loc[bucket_events["team"] == team])
            team_scores.append(TeamMomentumScore(team=team, score=score))

        sorted_scores = sorted(team_scores, key=lambda item: item.score, reverse=True)
        leader = None if len(sorted_scores) < 2 or sorted_scores[0].score == sorted_scores[1].score == 0 else sorted_scores[0].team
        margin = 0.0
        if len(sorted_scores) >= 2:
            margin = round(sorted_scores[0].score - sorted_scores[1].score, 2)

        swing = False
        if previous_leader is not None and leader is not None and leader != previous_leader:
            swing = True
        elif margin > previous_margin + 3:
            swing = True

        note = _bucket_note(leader, swing, margin)
        buckets.append(
            MomentumBucket(
                bucket_start=bucket_start,
                bucket_end=bucket_end,
                label=_bucket_label(bucket_start, bucket_end),
                minute_mark=bucket_start + 2,
                scores=team_scores,
                leading_team=leader,
                swing=swing,
                swing_magnitude=margin,
                note=note,
            )
        )

        if leader is not None:
            previous_leader = leader
            previous_margin = margin

    return MatchMomentumResponse(match_id=match_id, teams=teams, buckets=buckets)
