import json
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

OPTIONAL_PLAYER_DIRECTORY_FILES = {
    "statsbomb_open_data": settings.data_path / "sources" / "statsbomb_open_data" / "player_directory.csv",
}

OPTIONAL_MATCH_DIRECTORY_FILES = {
    "statsbomb_open_data": settings.data_path / "sources" / "statsbomb_open_data" / "match_directory.csv",
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


def _deserialize_list(value: object) -> list[str]:
    if value is None:
        return []

    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]

    text = str(value).strip()
    if not text:
        return []

    try:
        parsed = json.loads(text)
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]
    except json.JSONDecodeError:
        pass

    return [item.strip() for item in text.split("|") if item.strip()]


def _read_optional_directory_csv(source_name: str, source_file: Path, required_columns: list[str]) -> pd.DataFrame:
    if not source_file.exists():
        return pd.DataFrame(columns=required_columns)

    frame = pd.read_csv(source_file)
    for column in required_columns:
        if column not in frame.columns:
            frame[column] = "[]" if column in {"sources", "teams"} else ""

    frame = frame[required_columns].copy()
    for column in {"player_id", "player_name", "team", "nationality", "position", "match_id", "title", "competition", "season"}:
        if column in frame.columns:
            frame[column] = frame[column].fillna("").astype(str).str.strip()

    if "sources" in frame.columns:
        frame["sources"] = frame["sources"].apply(lambda value: _deserialize_list(value) or [source_name])

    if "teams" in frame.columns:
        frame["teams"] = frame["teams"].apply(_deserialize_list)

    return frame


def _sort_player_directory(frame: pd.DataFrame) -> pd.DataFrame:
    if frame.empty:
        return frame

    sorted_frame = frame.copy()
    sorted_frame["analytics_priority"] = sorted_frame["has_analytics"].astype(int)
    sorted_frame["display_priority"] = sorted_frame["is_indian"].astype(int)
    return (
        sorted_frame.sort_values(["analytics_priority", "display_priority", "player_name"], ascending=[False, False, True])
        .reset_index(drop=True)
    )


def _merge_player_frames(primary: pd.DataFrame, secondary: pd.DataFrame) -> pd.DataFrame:
    if secondary.empty:
        return _sort_player_directory(primary)

    merged: dict[str, dict] = {}
    combined = pd.concat(
        [
            primary.assign(_priority=1),
            secondary.assign(_priority=0),
        ],
        ignore_index=True,
    ).sort_values(["_priority", "is_indian", "player_name"], ascending=[False, False, True])

    for row in combined.itertuples(index=False):
        current = merged.get(row.player_id)
        row_sources = sorted(set(getattr(row, "sources", []) or []))
        if current is None:
            merged[row.player_id] = {
                "player_id": row.player_id,
                "player_name": row.player_name,
                "team": row.team,
                "nationality": row.nationality,
                "position": row.position,
                "sources": row_sources,
                "has_analytics": bool(getattr(row, "has_analytics", False)),
                "is_indian": bool(row.is_indian),
            }
            continue

        current["sources"] = sorted(set(current["sources"]) | set(row_sources))
        current["has_analytics"] = current["has_analytics"] or bool(getattr(row, "has_analytics", False))
        current["is_indian"] = current["is_indian"] or bool(row.is_indian)
        for column in ["player_name", "team", "nationality", "position"]:
            if not current[column] and getattr(row, column):
                current[column] = getattr(row, column)

    return _sort_player_directory(pd.DataFrame.from_records(list(merged.values())))


def _merge_match_frames(primary: pd.DataFrame, secondary: pd.DataFrame) -> pd.DataFrame:
    if secondary.empty:
        sorted_primary = primary.copy()
        if "has_events" not in sorted_primary.columns:
            sorted_primary["has_events"] = True
        return sorted_primary.sort_values(["has_events", "competition", "title", "match_id"], ascending=[False, True, True, True]).reset_index(drop=True)

    merged: dict[str, dict] = {}
    combined = pd.concat(
        [
            primary.assign(_priority=1),
            secondary.assign(_priority=0),
        ],
        ignore_index=True,
    ).sort_values(["_priority", "competition", "title"], ascending=[False, True, True])

    for row in combined.itertuples(index=False):
        current = merged.get(row.match_id)
        row_sources = sorted(set(getattr(row, "sources", []) or []))
        row_teams = list(dict.fromkeys(getattr(row, "teams", []) or []))
        if current is None:
            merged[row.match_id] = {
                "match_id": row.match_id,
                "title": row.title,
                "competition": row.competition,
                "season": row.season,
                "teams": row_teams,
                "sources": row_sources,
                "has_events": bool(getattr(row, "has_events", False)),
                "home_score": int(getattr(row, "home_score", 0) or 0),
                "away_score": int(getattr(row, "away_score", 0) or 0),
            }
            continue

        current["sources"] = sorted(set(current["sources"]) | set(row_sources))
        current["teams"] = list(dict.fromkeys([*current["teams"], *row_teams]))
        current["has_events"] = current["has_events"] or bool(getattr(row, "has_events", False))
        current["home_score"] = current["home_score"] or int(getattr(row, "home_score", 0) or 0)
        current["away_score"] = current["away_score"] or int(getattr(row, "away_score", 0) or 0)
        for column in ["title", "competition", "season"]:
            if not current[column] and getattr(row, column):
                current[column] = getattr(row, column)

    return pd.DataFrame.from_records(list(merged.values())).sort_values(
        ["has_events", "competition", "title", "match_id"],
        ascending=[False, True, True, True],
    ).reset_index(drop=True)


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
    event_directory = (
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
    event_directory["is_indian"] = event_directory["nationality"].str.casefold().eq("india")
    event_directory["has_analytics"] = True

    extra_frames = [
        _read_optional_directory_csv(
            source_name,
            source_file,
            ["player_id", "player_name", "team", "nationality", "position", "sources"],
        )
        for source_name, source_file in OPTIONAL_PLAYER_DIRECTORY_FILES.items()
    ]
    extra_directory = pd.concat(extra_frames, ignore_index=True) if extra_frames else pd.DataFrame()
    if not extra_directory.empty:
        extra_directory["is_indian"] = extra_directory["nationality"].str.casefold().eq("india")
        extra_directory["has_analytics"] = False

    return _merge_player_frames(event_directory, extra_directory)


@lru_cache(maxsize=1)
def load_match_directory() -> pd.DataFrame:
    events = load_all_events()
    event_directory = (
        events.groupby("match_id")
        .agg(
            competition=("competition", "last"),
            season=("season", "last"),
            sources=("source", lambda values: sorted(set(values))),
        )
        .reset_index()
    )
    team_lookup = (
        events.groupby("match_id")
        .apply(
            lambda frame: list(
                dict.fromkeys(
                    [
                        str(value).strip()
                        for value in [*frame["team"].tolist(), *frame["opponent"].tolist()]
                        if str(value).strip()
                    ]
                )
            )[:2],
            include_groups=False,
        )
        .reset_index(name="teams")
    )
    event_directory = event_directory.merge(team_lookup, on="match_id", how="left")
    event_directory["title"] = event_directory["teams"].apply(lambda teams: " vs ".join(teams[:2]) if teams else "Match")
    event_directory["has_events"] = True
    score_lookup = (
        events.groupby(["match_id", "team"])["goal"]
        .sum()
        .reset_index()
        .groupby("match_id")
        .apply(
            lambda frame: {
                str(row.team).strip(): int(row.goal)
                for row in frame.itertuples(index=False)
                if str(row.team).strip()
            },
            include_groups=False,
        )
        .reset_index(name="score_map")
    )
    event_directory = event_directory.merge(score_lookup, on="match_id", how="left")
    event_directory["home_score"] = event_directory.apply(
        lambda row: int((row.score_map or {}).get(row.teams[0], 0)) if row.teams else 0,
        axis=1,
    )
    event_directory["away_score"] = event_directory.apply(
        lambda row: int((row.score_map or {}).get(row.teams[1], 0)) if isinstance(row.teams, list) and len(row.teams) > 1 else 0,
        axis=1,
    )

    extra_frames = [
        _read_optional_directory_csv(
            source_name,
            source_file,
            ["match_id", "title", "competition", "season", "teams", "sources"],
        )
        for source_name, source_file in OPTIONAL_MATCH_DIRECTORY_FILES.items()
    ]
    extra_directory = pd.concat(extra_frames, ignore_index=True) if extra_frames else pd.DataFrame()
    if not extra_directory.empty:
        extra_directory["has_events"] = False
        extra_directory["home_score"] = 0
        extra_directory["away_score"] = 0

    return _merge_match_frames(event_directory, extra_directory)


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
            has_analytics=bool(row.has_analytics),
            is_indian=bool(row.is_indian),
            sources=list(row.sources),
        )
        for row in directory.itertuples(index=False)
    ]
    return PlayerListResponse(players=players)


def list_matches() -> MatchListResponse:
    grouped = load_match_directory()
    matches = []
    for row in grouped.itertuples(index=False):
        teams = list(row.teams)
        if len(teams) >= 2:
            title = f"{teams[0]} vs {teams[1]}"
        elif teams:
            title = teams[0]
        else:
            title = str(row.match_id)

        matches.append(
            MatchListItem(
                match_id=str(row.match_id),
                title=title,
                competition=str(row.competition),
                season=str(row.season),
                status="completed" if bool(getattr(row, "has_events", False)) else "upcoming",
                home_score=int(getattr(row, "home_score", 0) or 0),
                away_score=int(getattr(row, "away_score", 0) or 0),
                teams=list(teams),
                sources=list(row.sources),
            )
        )

    status_priority = {"completed": 0, "upcoming": 1}
    matches.sort(key=lambda item: (status_priority.get(item.status, 2), item.competition, item.title, item.match_id))
    return MatchListResponse(matches=matches)
