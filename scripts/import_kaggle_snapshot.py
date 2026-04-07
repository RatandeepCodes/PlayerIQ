from __future__ import annotations

import argparse
import csv
import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from io import TextIOWrapper
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "data" / "sources" / "kaggle_indian_players"
EVENTS_OUTPUT = OUTPUT_DIR / "events.csv"
METADATA_OUTPUT = OUTPUT_DIR / "refresh_metadata.json"

REQUIRED_COLUMNS = [
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


@dataclass(slots=True)
class KaggleRefreshSummary:
    source: str
    dataset_name: str
    refreshed_at_utc: str
    row_count: int
    output_dir: str
    events_output: str
    input_path: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Refresh local Kaggle snapshot event data.")
    parser.add_argument(
        "--input",
        required=True,
        help="Path to a Kaggle CSV export or ZIP archive containing the event snapshot.",
    )
    parser.add_argument(
        "--dataset-name",
        default="kaggle_indian_players",
        help="Internal source label to stamp onto the imported rows.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(OUTPUT_DIR),
        help="Directory where the refreshed events.csv should be written.",
    )
    return parser.parse_args()


def _load_csv_rows(csv_path: Path) -> list[dict]:
    with csv_path.open("r", newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        return list(reader)


def _load_zip_rows(zip_path: Path) -> list[dict]:
    with ZipFile(zip_path) as archive:
        csv_members = [member for member in archive.namelist() if member.lower().endswith(".csv")]
        if not csv_members:
            raise ValueError("ZIP archive does not contain a CSV file")

        preferred = next((member for member in csv_members if "event" in Path(member).name.lower()), csv_members[0])
        with archive.open(preferred) as handle:
            reader = csv.DictReader(TextIOWrapper(handle, encoding="utf-8-sig"))
            return list(reader)


def load_rows(input_path: Path) -> list[dict]:
    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    if input_path.suffix.lower() == ".zip":
        return _load_zip_rows(input_path)

    if input_path.suffix.lower() == ".csv":
        return _load_csv_rows(input_path)

    raise ValueError("Input must be a CSV or ZIP file")


def validate_rows(rows: list[dict]) -> None:
    if not rows:
        raise ValueError("Input dataset is empty")

    columns = set(rows[0].keys())
    missing = [column for column in REQUIRED_COLUMNS if column not in columns]
    if missing:
        raise ValueError(f"Input dataset is missing required columns: {', '.join(missing)}")


def normalize_rows(rows: list[dict], dataset_name: str) -> list[dict]:
    normalized = []
    for row in rows:
        normalized_row = {column: row.get(column, "") for column in REQUIRED_COLUMNS}
        normalized_row["source"] = dataset_name
        normalized.append(normalized_row)

    return sorted(
        normalized,
        key=lambda row: (
            row.get("competition", ""),
            row.get("season", ""),
            row.get("match_id", ""),
            int(row.get("minute") or 0),
            int(row.get("second") or 0),
            row.get("player_id", ""),
        ),
    )


def write_csv(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=REQUIRED_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


def write_metadata(path: Path, summary: KaggleRefreshSummary) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(asdict(summary), indent=2), encoding="utf-8")


def refresh_kaggle_snapshot(
    input_path: Path,
    dataset_name: str = "kaggle_indian_players",
    output_dir: Path = OUTPUT_DIR,
) -> KaggleRefreshSummary:
    rows = load_rows(input_path)
    validate_rows(rows)
    normalized_rows = normalize_rows(rows, dataset_name=dataset_name)

    events_output = output_dir / EVENTS_OUTPUT.name
    metadata_output = output_dir / METADATA_OUTPUT.name

    write_csv(events_output, normalized_rows)

    summary = KaggleRefreshSummary(
        source="kaggle_snapshot",
        dataset_name=dataset_name,
        refreshed_at_utc=datetime.now(timezone.utc).isoformat(),
        row_count=len(normalized_rows),
        output_dir=str(output_dir),
        events_output=str(events_output),
        input_path=str(input_path),
    )
    write_metadata(metadata_output, summary)
    return summary


def main() -> None:
    args = parse_args()
    summary = refresh_kaggle_snapshot(
        input_path=Path(args.input),
        dataset_name=args.dataset_name,
        output_dir=Path(args.output_dir),
    )

    print(f"Kaggle snapshot refresh completed at {summary.refreshed_at_utc}")
    print(f"wrote {summary.row_count} events -> {summary.events_output}")
    print(f"metadata -> {Path(summary.output_dir) / METADATA_OUTPUT.name}")


if __name__ == "__main__":
    main()
