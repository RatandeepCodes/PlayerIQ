from functools import lru_cache
from pathlib import Path

import pandas as pd

from app.core.config import settings
from app.schemas.analytics import DatasetSummaryResponse, PlayerListItem, PlayerListResponse

REQUIRED_EVENT_COLUMNS = [
    "source",
    "match_id",
    "competition",
    "season",
    "minute",
    "second",
    "timestamp",
    "team",
    "opponent",
    "player_id",
    "player_name",
    "nationality",
    "position",
    "event_type",
    "outcome",
    "xg",
    "is_key_pass",
    "progressive_pass",
    "dribble_success",
    "shot_on_target",
    "goal",
    "score_difference",
]

SOURCE_FILES = {
    "statsbomb_open_data": settings.data_path / "sources" / "statsbomb_open_data" / "events.csv",
    "kaggle_indian_players": settings.data_path / "sources" / "kaggle_indian_players" / "events.csv",
}


def _normalize_frame(frame: pd.DataFrame, source_name: str) -> pd.DataFrame:
    normalized = frame.copy()
    normalized["source"] = source_name

    for column in REQUIRED_EVENT_COLUMNS:
        if column not in normalized.columns:
            if column == "xg":
                normalized[column] = 0.0
            elif column in {"is_key_pass", "progressive_pass", "dribble_success", "shot_on_target", "goal"}:
                normalized[column] = 0
            else:
                normalized[column] = ""

    normalized = normalized[REQUIRED_EVENT_COLUMNS]
    normalized["minute"] = normalized["minute"].astype(int)
    normalized["second"] = normalized["second"].astype(int)
    normalized["xg"] = normalized["xg"].astype(float)
    normalized["is_key_pass"] = normalized["is_key_pass"].astype(int)
    normalized["progressive_pass"] = normalized["progressive_pass"].astype(int)
    normalized["dribble_success"] = normalized["dribble_success"].astype(int)
    normalized["shot_on_target"] = normalized["shot_on_target"].astype(int)
    normalized["goal"] = normalized["goal"].astype(int)
    normalized["score_difference"] = normalized["score_difference"].astype(int)
    normalized["player_id"] = normalized["player_id"].astype(str)
    normalized["match_id"] = normalized["match_id"].astype(str)
    return normalized.sort_values(["match_id", "minute", "second"]).reset_index(drop=True)


def _read_source_csv(source_name: str, source_file: Path) -> pd.DataFrame:
    if not source_file.exists():
        raise FileNotFoundError(f"Required source file is missing: {source_file}")
    frame = pd.read_csv(source_file)
    return _normalize_frame(frame, source_name)


@lru_cache(maxsize=1)
def load_all_events() -> pd.DataFrame:
    frames = [_read_source_csv(source_name, source_file) for source_name, source_file in SOURCE_FILES.items()]
    return pd.concat(frames, ignore_index=True)


@lru_cache(maxsize=1)
def load_player_directory() -> pd.DataFrame:
    events = load_all_events()
    grouped = (
        events.groupby("player_id")
        .agg(
            player_name=("player_name", "last"),
            team=("team", "last"),
            nationality=("nationality", "last"),
            position=("position", "last"),
            sources=("source", lambda values: sorted(set(values))),
        )
        .reset_index()
    )
    grouped["is_indian"] = grouped["nationality"].str.casefold().eq("india")
    return grouped.sort_values("player_name").reset_index(drop=True)


def get_player_metadata(player_id: str) -> dict:
    directory = load_player_directory()
    player_rows = directory.loc[directory["player_id"] == player_id]
    if player_rows.empty:
        raise KeyError(f"Player '{player_id}' not found in source data")
    return player_rows.iloc[0].to_dict()


def get_match_events(match_id: str) -> pd.DataFrame:
    events = load_all_events()
    match_events = events.loc[events["match_id"] == match_id].copy()
    if match_events.empty:
        raise KeyError(f"Match '{match_id}' not found in event dataset")
    return match_events.sort_values(["minute", "second"]).reset_index(drop=True)


def get_dataset_summary() -> DatasetSummaryResponse:
    events = load_all_events()
    players = load_player_directory()
    return DatasetSummaryResponse(
        total_events=int(len(events)),
        total_players=int(len(players)),
        indian_players=int(players["is_indian"].sum()),
        competitions=sorted(events["competition"].unique().tolist()),
        sources=sorted(events["source"].unique().tolist()),
    )


def list_players() -> PlayerListResponse:
    directory = load_player_directory()
    players = [
        PlayerListItem(
            player_id=str(row.player_id),
            player_name=str(row.player_name),
            team=str(row.team),
            nationality=str(row.nationality),
            position=str(row.position),
            is_indian=bool(row.is_indian),
            sources=list(row.sources),
        )
        for row in directory.itertuples(index=False)
    ]
    return PlayerListResponse(players=players)
