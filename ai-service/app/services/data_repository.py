from functools import lru_cache
from pathlib import Path

import pandas as pd

from app.core.config import settings
from app.schemas.analytics import DatasetSummaryResponse, MatchListItem, MatchListResponse, PlayerListItem, PlayerListResponse

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

NUMERIC_DEFAULTS = {
    "minute": 0,
    "second": 0,
    "xg": 0.0,
    "is_key_pass": 0,
    "progressive_pass": 0,
    "dribble_success": 0,
    "shot_on_target": 0,
    "goal": 0,
    "score_difference": 0,
}

TEXT_COLUMNS = {
    "source",
    "match_id",
    "competition",
    "season",
    "timestamp",
    "team",
    "opponent",
    "player_id",
    "player_name",
    "nationality",
    "position",
    "event_type",
    "outcome",
}


def _coerce_numeric_column(frame: pd.DataFrame, column: str, default: int | float) -> pd.Series:
    coerced = pd.to_numeric(frame[column], errors="coerce").fillna(default)
    return coerced


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
    for column, default in NUMERIC_DEFAULTS.items():
        normalized[column] = _coerce_numeric_column(normalized, column, default)

    for column in TEXT_COLUMNS:
        normalized[column] = normalized[column].fillna("").astype(str).str.strip()

    normalized["minute"] = normalized["minute"].clip(lower=0).astype(int)
    normalized["second"] = normalized["second"].clip(lower=0, upper=59).astype(int)
    normalized["xg"] = normalized["xg"].clip(lower=0.0).astype(float)
    normalized["is_key_pass"] = normalized["is_key_pass"].clip(lower=0, upper=1).astype(int)
    normalized["progressive_pass"] = normalized["progressive_pass"].clip(lower=0, upper=1).astype(int)
    normalized["dribble_success"] = normalized["dribble_success"].clip(lower=0, upper=1).astype(int)
    normalized["shot_on_target"] = normalized["shot_on_target"].clip(lower=0, upper=1).astype(int)
    normalized["goal"] = normalized["goal"].clip(lower=0, upper=1).astype(int)
    normalized["score_difference"] = normalized["score_difference"].astype(int)
    return normalized.sort_values(["match_id", "minute", "second"]).reset_index(drop=True)


def _read_source_csv(source_name: str, source_file: Path) -> pd.DataFrame:
    if not source_file.exists():
        raise FileNotFoundError(f"Required source file is missing: {source_file}")
    frame = pd.read_csv(source_file)
    return _normalize_frame(frame, source_name)


@lru_cache(maxsize=1)
def get_source_file_status() -> dict:
    available_sources: list[str] = []
    missing_sources: list[str] = []

    for source_name, source_file in SOURCE_FILES.items():
        if source_file.exists():
            available_sources.append(source_name)
        else:
            missing_sources.append(source_name)

    return {
        "available_sources": sorted(available_sources),
        "missing_sources": sorted(missing_sources),
        "configured_sources": sorted(SOURCE_FILES.keys()),
        "data_path": str(settings.data_path),
    }


@lru_cache(maxsize=1)
def load_all_events() -> pd.DataFrame:
    frames = [
        _read_source_csv(source_name, source_file)
        for source_name, source_file in SOURCE_FILES.items()
        if source_file.exists()
    ]
    if not frames:
        raise RuntimeError(f"No source event files are available under {settings.data_path}")
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
    grouped["display_priority"] = grouped["is_indian"].astype(int)
    return grouped.sort_values(["display_priority", "player_name"], ascending=[False, True]).reset_index(drop=True)


@lru_cache(maxsize=1)
def load_match_directory() -> pd.DataFrame:
    events = load_all_events()
    grouped = (
        events.groupby("match_id")
        .agg(
            competition=("competition", "last"),
            season=("season", "last"),
            teams=("team", lambda values: sorted(set(value for value in values if value))),
            sources=("source", lambda values: sorted(set(values))),
        )
        .reset_index()
    )
    grouped["title"] = grouped["teams"].apply(lambda teams: " vs ".join(teams[:2]) if teams else "Match")
    return grouped.sort_values(["competition", "title"]).reset_index(drop=True)


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


def get_dataset_health() -> dict:
    source_status = get_source_file_status()

    try:
        summary = get_dataset_summary()
        warnings: list[str] = []
        if source_status["missing_sources"]:
            warnings.append("One or more configured data sources are missing from disk.")

        status = "ok" if not warnings else "degraded"
        return {
            "status": status,
            "dataset": summary.model_dump(by_alias=True),
            "sources": source_status,
            "warnings": warnings,
        }
    except RuntimeError as error:
        return {
            "status": "offline",
            "dataset": None,
            "sources": source_status,
            "warnings": [str(error)],
        }


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


def list_matches() -> MatchListResponse:
    directory = load_match_directory()
    matches = [
        MatchListItem(
            match_id=str(row.match_id),
            title=str(row.title),
            teams=list(row.teams),
            competition=str(row.competition),
            season=str(row.season),
            sources=list(row.sources),
        )
        for row in directory.itertuples(index=False)
    ]
    return MatchListResponse(matches=matches)
