from functools import lru_cache

import pandas as pd

from app.services.data_repository import get_player_metadata, load_all_events

PRESSURE_MINUTE_THRESHOLD = 75
RAW_SCORE_COLUMNS = [
    "shooting_raw",
    "passing_raw",
    "dribbling_raw",
    "defending_raw",
    "creativity_raw",
    "physical_raw",
]
PRIOR_MATCH_WEIGHT = 3.0


def _safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    if denominator == 0:
        return default
    return numerator / denominator


def _count_mask(events: pd.DataFrame, event_type: str, success_only: bool = False) -> int:
    mask = events["event_type"].eq(event_type)
    if success_only:
        mask &= events["outcome"].eq("success")
    return int(mask.sum())


def _performance_score(events: pd.DataFrame) -> float:
    if events.empty:
        return 0.0

    passes_completed = int((events["event_type"].eq("pass") & events["outcome"].eq("success")).sum())
    key_passes = int(events["is_key_pass"].sum())
    progressive_passes = int(events["progressive_pass"].sum())
    shots = int(events["event_type"].eq("shot").sum())
    dribbles_completed = int(events["dribble_success"].sum())
    tackles_won = int((events["event_type"].eq("tackle") & events["outcome"].eq("success")).sum())
    interceptions = int(events["event_type"].eq("interception").sum())
    recoveries = int(events["event_type"].eq("recovery").sum())
    xg_total = float(events["xg"].sum())
    goals = int(events["goal"].sum())

    return (
        passes_completed * 0.6
        + key_passes * 2.4
        + progressive_passes * 1.8
        + shots * 2.8
        + dribbles_completed * 1.7
        + tackles_won * 1.8
        + interceptions * 1.6
        + recoveries * 1.2
        + xg_total * 14.0
        + goals * 5.0
    )


def _scale_series(series: pd.Series, lower: int = 35, upper: int = 99) -> pd.Series:
    if series.nunique() <= 1:
        midpoint = round((lower + upper) / 2)
        return pd.Series([midpoint] * len(series), index=series.index, dtype="int64")

    scaled = lower + (series - series.min()) * (upper - lower) / (series.max() - series.min())
    return scaled.round().clip(lower, upper).astype("int64")


def _scale_value_against_reference(value: float, reference: pd.Series, lower: int = 35, upper: int = 99) -> int:
    reference_min = float(reference.min())
    reference_max = float(reference.max())

    if reference_max <= reference_min:
        return round((lower + upper) / 2)

    scaled = lower + (value - reference_min) * (upper - lower) / (reference_max - reference_min)
    return int(round(max(lower, min(upper, scaled))))


def _aggregate_player_metrics(events: pd.DataFrame) -> pd.DataFrame:
    working = events.copy()
    working["is_pressure"] = (working["minute"] >= PRESSURE_MINUTE_THRESHOLD) & (
        working["score_difference"].abs() <= 1
    )

    records: list[dict] = []
    for player_id, frame in working.groupby("player_id"):
        metadata = get_player_metadata(player_id)
        matches_played = int(frame["match_id"].nunique())
        total_events = int(len(frame))
        passes_attempted = _count_mask(frame, "pass")
        passes_completed = _count_mask(frame, "pass", success_only=True)
        key_passes = int(frame["is_key_pass"].sum())
        progressive_passes = int(frame["progressive_pass"].sum())
        shots = _count_mask(frame, "shot")
        shots_on_target = int(frame["shot_on_target"].sum())
        goals = int(frame["goal"].sum())
        xg_total = float(frame["xg"].sum())
        dribbles_attempted = _count_mask(frame, "dribble")
        dribbles_completed = int(frame["dribble_success"].sum())
        tackles_won = _count_mask(frame, "tackle", success_only=True)
        interceptions = _count_mask(frame, "interception")
        clearances = _count_mask(frame, "clearance")
        recoveries = _count_mask(frame, "recovery")
        defensive_actions = tackles_won + interceptions + clearances + recoveries
        successful_actions = int(frame["outcome"].eq("success").sum())
        success_rate = _safe_divide(successful_actions, total_events)
        pass_accuracy = _safe_divide(passes_completed, passes_attempted)
        dribble_success_rate = _safe_divide(dribbles_completed, dribbles_attempted)
        pressure_events = int(frame["is_pressure"].sum())
        pressure_frame = frame[frame["is_pressure"]]
        normal_frame = frame[~frame["is_pressure"]]
        pressure_raw = _performance_score(pressure_frame)
        normal_raw = _performance_score(normal_frame)
        if normal_raw == 0 and pressure_raw > 0:
            pressure_index = 1.15
        elif normal_raw == 0:
            pressure_index = 1.0
        else:
            pressure_index = pressure_raw / normal_raw

        pressure_actions = int(
            pressure_frame["event_type"].isin(["pass", "shot", "dribble", "tackle", "interception"]).sum()
        )
        matches_denominator = max(matches_played, 1)
        records.append(
            {
                "player_id": player_id,
                "player_name": metadata["player_name"],
                "team": metadata["team"],
                "nationality": metadata["nationality"],
                "position": metadata["position"],
                "matches_played": matches_played,
                "sources": metadata["sources"],
                "is_indian": metadata["is_indian"],
                "total_events": total_events,
                "passes_attempted": passes_attempted,
                "passes_completed": passes_completed,
                "pass_accuracy": pass_accuracy,
                "key_passes": key_passes,
                "progressive_passes": progressive_passes,
                "shots": shots,
                "shots_on_target": shots_on_target,
                "goals": goals,
                "xg_total": xg_total,
                "dribbles_attempted": dribbles_attempted,
                "dribbles_completed": dribbles_completed,
                "dribble_success_rate": dribble_success_rate,
                "tackles_won": tackles_won,
                "interceptions": interceptions,
                "clearances": clearances,
                "recoveries": recoveries,
                "defensive_actions": defensive_actions,
                "success_rate": success_rate,
                "pressure_events": pressure_events,
                "pressure_actions": pressure_actions,
                "pressure_raw": pressure_raw,
                "normal_raw": normal_raw,
                "pressure_index": pressure_index,
                "passes_per_match": passes_completed / matches_denominator,
                "key_passes_per_match": key_passes / matches_denominator,
                "progressive_passes_per_match": progressive_passes / matches_denominator,
                "shots_per_match": shots / matches_denominator,
                "shots_on_target_per_match": shots_on_target / matches_denominator,
                "goals_per_match": goals / matches_denominator,
                "xg_per_match": xg_total / matches_denominator,
                "dribbles_per_match": dribbles_attempted / matches_denominator,
                "dribbles_completed_per_match": dribbles_completed / matches_denominator,
                "tackles_per_match": tackles_won / matches_denominator,
                "interceptions_per_match": interceptions / matches_denominator,
                "clearances_per_match": clearances / matches_denominator,
                "recoveries_per_match": recoveries / matches_denominator,
                "defensive_actions_per_match": defensive_actions / matches_denominator,
                "pressure_actions_per_match": pressure_actions / matches_denominator,
            }
        )

    frame = pd.DataFrame.from_records(records).sort_values("player_name").reset_index(drop=True)
    if frame.empty:
        return frame

    frame["shooting_raw"] = (
        frame["shots_per_match"] * 10
        + frame["shots_on_target_per_match"] * 14
        + frame["goals_per_match"] * 18
        + frame["xg_per_match"] * 20
    )
    frame["passing_raw"] = (
        frame["pass_accuracy"] * 60
        + frame["passes_per_match"] * 1.6
        + frame["progressive_passes_per_match"] * 11
        + frame["key_passes_per_match"] * 15
    )
    frame["dribbling_raw"] = (
        frame["dribbles_completed_per_match"] * 16
        + frame["dribble_success_rate"] * 40
        + frame["progressive_passes_per_match"] * 4
    )
    frame["defending_raw"] = (
        frame["tackles_per_match"] * 18
        + frame["interceptions_per_match"] * 16
        + frame["clearances_per_match"] * 10
        + frame["recoveries_per_match"] * 8
    )
    frame["creativity_raw"] = (
        frame["key_passes_per_match"] * 18
        + frame["progressive_passes_per_match"] * 12
        + frame["pass_accuracy"] * 30
        + frame["xg_per_match"] * 4
    )
    frame["physical_raw"] = (
        frame["defensive_actions_per_match"] * 9
        + frame["recoveries_per_match"] * 10
        + frame["pressure_actions_per_match"] * 7
        + frame["success_rate"] * 25
    )

    reliability = (frame["matches_played"] / (frame["matches_played"] + PRIOR_MATCH_WEIGHT)).clip(lower=0.25, upper=1.0)
    for column in RAW_SCORE_COLUMNS:
        population_mean = frame[column].mean()
        frame[column] = (frame[column] * reliability) + (population_mean * (1.0 - reliability))

    frame["pressure_index"] = (frame["pressure_index"] * reliability) + (1.0 * (1.0 - reliability))

    frame["shooting_score"] = _scale_series(frame["shooting_raw"])
    frame["passing_score"] = _scale_series(frame["passing_raw"])
    frame["dribbling_score"] = _scale_series(frame["dribbling_raw"])
    frame["defending_score"] = _scale_series(frame["defending_raw"])
    frame["creativity_score"] = _scale_series(frame["creativity_raw"])
    frame["physical_score"] = _scale_series(frame["physical_raw"])

    frame["ppi_raw"] = (
        frame["shooting_raw"] * 0.24
        + frame["passing_raw"] * 0.16
        + frame["dribbling_raw"] * 0.16
        + frame["defending_raw"] * 0.18
        + frame["creativity_raw"] * 0.16
        + frame["physical_raw"] * 0.10
    )
    frame["ppi"] = _scale_series(frame["ppi_raw"], lower=30, upper=99)
    frame["overall_rating"] = (
        frame[
            [
                "shooting_score",
                "passing_score",
                "dribbling_score",
                "defending_score",
                "creativity_score",
                "physical_score",
            ]
        ]
        .mean(axis=1)
        .round()
        .astype("int64")
    )
    frame["pressure_index"] = frame["pressure_index"].clip(lower=0.5, upper=1.6).round(2)
    frame["pressure_score"] = _scale_series(frame["pressure_index"], lower=25, upper=99)
    return frame


@lru_cache(maxsize=1)
def get_player_feature_table() -> pd.DataFrame:
    return _aggregate_player_metrics(load_all_events())


def get_player_features(player_id: str) -> dict:
    table = get_player_feature_table()
    player_rows = table.loc[table["player_id"] == player_id]
    if player_rows.empty:
        raise KeyError(f"Player '{player_id}' not found in analytics dataset")

    row = player_rows.iloc[0].to_dict()
    row["sources"] = list(row["sources"])
    return row


def get_feature_matrix_for_clustering() -> pd.DataFrame:
    table = get_player_feature_table().copy()
    columns = [
        "pass_accuracy",
        "key_passes_per_match",
        "progressive_passes_per_match",
        "shots_per_match",
        "xg_per_match",
        "dribbles_completed_per_match",
        "defensive_actions_per_match",
        "recoveries_per_match",
    ]
    return table[["player_id", "player_name", *columns]].copy()


def get_live_feature_snapshot(event_slice: pd.DataFrame, player_id: str) -> dict:
    if event_slice.loc[event_slice["player_id"] == player_id].empty:
        raise KeyError(f"Player '{player_id}' not found in live event slice")

    live_table = _aggregate_player_metrics(event_slice)
    player_rows = live_table.loc[live_table["player_id"] == player_id]
    if player_rows.empty:
        raise KeyError(f"Player '{player_id}' not found in live feature table")

    live_row = player_rows.iloc[0].to_dict()
    reference_table = get_player_feature_table()
    for metric in ["shooting", "passing", "dribbling", "defending", "creativity", "physical"]:
        raw_column = f"{metric}_raw"
        score_column = f"{metric}_score"
        live_row[score_column] = _scale_value_against_reference(live_row[raw_column], reference_table[raw_column])

    live_row["ppi"] = _scale_value_against_reference(live_row["ppi_raw"], reference_table["ppi_raw"], lower=30, upper=99)
    live_row["overall_rating"] = int(
        round(
            (
                live_row["shooting_score"]
                + live_row["passing_score"]
                + live_row["dribbling_score"]
                + live_row["defending_score"]
                + live_row["creativity_score"]
                + live_row["physical_score"]
            )
            / 6
        )
    )
    live_row["pressure_score"] = _scale_value_against_reference(
        live_row["pressure_index"], reference_table["pressure_index"], lower=25, upper=99
    )
    live_row["sources"] = list(live_row["sources"])
    return live_row
