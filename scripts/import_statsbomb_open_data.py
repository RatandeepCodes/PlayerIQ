from __future__ import annotations

import argparse
import csv
import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen
from zipfile import ZipFile

ARCHIVE_URL = "https://github.com/statsbomb/open-data/archive/refs/heads/master.zip"
ARCHIVE_PREFIX = "open-data-master/data/"

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "data" / "sources" / "statsbomb_open_data"
PLAYER_OUTPUT = OUTPUT_DIR / "player_directory.csv"
MATCH_OUTPUT = OUTPUT_DIR / "match_directory.csv"
METADATA_OUTPUT = OUTPUT_DIR / "refresh_metadata.json"


@dataclass(slots=True)
class RefreshSummary:
    source: str
    archive_url: str
    refreshed_at_utc: str
    player_count: int
    match_count: int
    output_dir: str
    player_output: str
    match_output: str


def download_archive(archive_url: str = ARCHIVE_URL, timeout: int = 60) -> bytes:
    request = Request(
        archive_url,
        headers={
            "User-Agent": "PlayerIQ StatsBomb Importer",
            "Accept": "application/zip",
        },
    )
    with urlopen(request, timeout=timeout) as response:
        return response.read()


def load_json_from_zip(archive: ZipFile, member_name: str):
    with archive.open(member_name) as handle:
        return json.load(handle)


def extract_players(archive: ZipFile) -> list[dict]:
    players: dict[str, dict] = {}
    lineup_prefix = f"{ARCHIVE_PREFIX}lineups/"

    for member_name in archive.namelist():
        if not member_name.startswith(lineup_prefix) or not member_name.endswith(".json"):
            continue

        try:
            lineup_payload = load_json_from_zip(archive, member_name)
        except json.JSONDecodeError:
            continue

        for team_entry in lineup_payload:
            team_name = str(team_entry.get("team_name") or "").strip()
            for player in team_entry.get("lineup", []):
                player_id = str(player.get("player_id") or "").strip()
                if not player_id:
                    continue

                position_entries = player.get("positions") or []
                first_position = position_entries[0] if position_entries else {}
                position_name = str(first_position.get("position") or "").strip()
                country_name = str((player.get("country") or {}).get("name") or "").strip()
                player_name = str(player.get("player_name") or player.get("player_nickname") or "").strip()

                current = players.get(player_id)
                if current is None:
                    players[player_id] = {
                        "player_id": player_id,
                        "player_name": player_name,
                        "team": team_name,
                        "nationality": country_name,
                        "position": position_name,
                        "sources": {"statsbomb_open_data"},
                    }
                    continue

                current["sources"].add("statsbomb_open_data")
                if not current["player_name"] and player_name:
                    current["player_name"] = player_name
                if not current["team"] and team_name:
                    current["team"] = team_name
                if not current["nationality"] and country_name:
                    current["nationality"] = country_name
                if not current["position"] and position_name:
                    current["position"] = position_name

    return sorted(
        (
            {
                **player,
                "sources": json.dumps(sorted(player["sources"])),
            }
            for player in players.values()
        ),
        key=lambda item: (item["player_name"], item["player_id"]),
    )


def extract_matches(archive: ZipFile) -> list[dict]:
    matches: dict[str, dict] = {}
    matches_prefix = f"{ARCHIVE_PREFIX}matches/"

    for member_name in archive.namelist():
        if not member_name.startswith(matches_prefix) or not member_name.endswith(".json"):
            continue

        try:
            match_payload = load_json_from_zip(archive, member_name)
        except json.JSONDecodeError:
            continue

        for match in match_payload:
            match_id = str(match.get("match_id") or "").strip()
            if not match_id:
                continue

            competition_name = str((match.get("competition") or {}).get("competition_name") or "").strip()
            season_name = str((match.get("season") or {}).get("season_name") or "").strip()
            home_team = str((match.get("home_team") or {}).get("home_team_name") or "").strip()
            away_team = str((match.get("away_team") or {}).get("away_team_name") or "").strip()
            teams = [team for team in [home_team, away_team] if team]
            title = " vs ".join(teams[:2]) if teams else match_id

            current = matches.get(match_id)
            if current is None:
                matches[match_id] = {
                    "match_id": match_id,
                    "title": title,
                    "competition": competition_name,
                    "season": season_name,
                    "teams": teams,
                    "sources": {"statsbomb_open_data"},
                }
                continue

            current["sources"].add("statsbomb_open_data")
            current["teams"] = list(dict.fromkeys([*current["teams"], *teams]))
            if not current["title"] and title:
                current["title"] = title
            if not current["competition"] and competition_name:
                current["competition"] = competition_name
            if not current["season"] and season_name:
                current["season"] = season_name

    return sorted(
        (
            {
                **match,
                "teams": json.dumps(match["teams"]),
                "sources": json.dumps(sorted(match["sources"])),
            }
            for match in matches.values()
        ),
        key=lambda item: (item["competition"], item["season"], item["title"], item["match_id"]),
    )


def write_csv(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def write_metadata(path: Path, summary: RefreshSummary) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(asdict(summary), indent=2), encoding="utf-8")


def refresh_statsbomb_open_data(
    archive_url: str = ARCHIVE_URL,
    output_dir: Path = OUTPUT_DIR,
    timeout: int = 60,
) -> RefreshSummary:
    player_output = output_dir / PLAYER_OUTPUT.name
    match_output = output_dir / MATCH_OUTPUT.name
    metadata_output = output_dir / METADATA_OUTPUT.name

    archive_bytes = download_archive(archive_url=archive_url, timeout=timeout)
    with ZipFile(BytesIO(archive_bytes)) as archive:
        players = extract_players(archive)
        matches = extract_matches(archive)

    write_csv(
        player_output,
        ["player_id", "player_name", "team", "nationality", "position", "sources"],
        players,
    )
    write_csv(
        match_output,
        ["match_id", "title", "competition", "season", "teams", "sources"],
        matches,
    )

    summary = RefreshSummary(
        source="statsbomb_open_data",
        archive_url=archive_url,
        refreshed_at_utc=datetime.now(timezone.utc).isoformat(),
        player_count=len(players),
        match_count=len(matches),
        output_dir=str(output_dir),
        player_output=str(player_output),
        match_output=str(match_output),
    )
    write_metadata(metadata_output, summary)
    return summary


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Refresh local StatsBomb open-data support files.")
    parser.add_argument("--archive-url", default=ARCHIVE_URL, help="Archive URL to download StatsBomb data from.")
    parser.add_argument(
        "--output-dir",
        default=str(OUTPUT_DIR),
        help="Directory where refreshed player and match CSV files should be written.",
    )
    parser.add_argument("--timeout", default=60, type=int, help="Download timeout in seconds.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    summary = refresh_statsbomb_open_data(
        archive_url=args.archive_url,
        output_dir=Path(args.output_dir),
        timeout=args.timeout,
    )

    print(f"StatsBomb refresh completed at {summary.refreshed_at_utc}")
    print(f"wrote {summary.player_count} players -> {summary.player_output}")
    print(f"wrote {summary.match_count} matches -> {summary.match_output}")
    print(f"metadata -> {METADATA_OUTPUT if Path(args.output_dir) == OUTPUT_DIR else Path(args.output_dir) / METADATA_OUTPUT.name}")


if __name__ == "__main__":
    main()
