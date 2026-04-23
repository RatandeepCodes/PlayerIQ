import unittest
from pathlib import Path
import shutil
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.services.comparison_engine import compare_players
from app.services.data_repository import (
    get_dataset_health,
    get_dataset_summary,
    get_match_events,
    get_source_file_status,
    list_matches,
    list_players,
    load_all_events,
)
from app.services.feature_engineering import (
    get_live_feature_snapshot,
    get_player_training_dataset,
    get_player_training_dataset_metadata,
)
from app.services.momentum_engine import get_match_momentum
from app.services.model_training import (
    archive_existing_rating_model,
    load_player_rating_model,
    predict_player_rating_from_features,
    retrain_and_persist_player_rating_model,
    train_and_persist_player_rating_model,
    train_player_rating_model,
)
from app.services.playstyle_engine import get_playstyle_profile
from app.services.pressure_engine import get_pressure_profile
from app.services.rating_engine import get_player_rating
from app.services.realtime_simulator import simulate_match
from app.services.report_generator import generate_player_summary
from app.services.turning_points import detect_turning_points


class PlayerIQAIPipelineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)

    def test_dataset_summary_includes_indian_players(self) -> None:
        summary = get_dataset_summary()
        self.assertGreater(summary.total_events, 0)
        self.assertGreater(summary.indian_players, 0)
        self.assertIn("kaggle_indian_players", summary.sources)
        self.assertIn("statsbomb_open_data", summary.sources)

    def test_dataset_health_reports_source_status(self) -> None:
        health = get_dataset_health()
        source_status = get_source_file_status()
        self.assertIn(health["status"], {"ok", "degraded"})
        self.assertEqual(sorted(health["sources"]["available_sources"]), sorted(source_status["available_sources"]))
        self.assertIsNotNone(health["dataset"])

    def test_player_directory_flags_indian_players(self) -> None:
        players = list_players()
        indian_players = [player for player in players.players if player.is_indian]
        self.assertGreaterEqual(len(indian_players), 4)
        self.assertTrue(players.players[0].is_indian)

    def test_match_directory_exposes_match_choices(self) -> None:
        matches = list_matches()
        self.assertGreaterEqual(len(matches.matches), 1)
        self.assertTrue(any("vs" in match.title for match in matches.matches))

    def test_rating_output_is_bounded(self) -> None:
        rating = get_player_rating("P101")
        self.assertGreaterEqual(rating.overall_rating, 0)
        self.assertLessEqual(rating.overall_rating, 100)
        self.assertEqual(rating.nationality, "India")
        self.assertIn("kaggle_indian_players", rating.sources)

    def test_rating_uses_trained_model_when_available(self) -> None:
        with patch("app.services.rating_engine._load_rating_model_for_inference", return_value=(object(), {"feature_columns": ["matches_played"]})):
            with patch("app.services.rating_engine.predict_player_rating_from_features", return_value=88.6):
                rating = get_player_rating("P101")
        self.assertEqual(rating.overall_rating, 89)

    def test_rating_falls_back_to_heuristic_when_model_is_unavailable(self) -> None:
        with patch("app.services.rating_engine._load_rating_model_for_inference", side_effect=FileNotFoundError("missing model")):
            rating = get_player_rating("P101")
        self.assertEqual(rating.overall_rating, 84)

    def test_sparse_sample_star_ratings_are_stabilized(self) -> None:
        messi = get_player_rating("P012")
        ronaldo = get_player_rating("P014")
        sunil = get_player_rating("P101")

        self.assertGreaterEqual(messi.overall_rating, 90)
        self.assertGreaterEqual(ronaldo.overall_rating, 84)
        self.assertGreaterEqual(sunil.overall_rating, 82)
        self.assertGreater(messi.overall_rating, sunil.overall_rating)

    def test_playstyle_returns_supported_role(self) -> None:
        playstyle = get_playstyle_profile("P001")
        self.assertIn(playstyle.playstyle, {"Playmaker", "Striker", "Defender", "Box-to-box", "Winger"})
        self.assertGreaterEqual(playstyle.cluster_distance, 0.0)

    def test_pressure_profile_has_events(self) -> None:
        pressure = get_pressure_profile("P104")
        self.assertGreaterEqual(pressure.pressure_events, 1)
        self.assertGreater(pressure.pressure_score, 0)

    def test_comparison_summary_mentions_players(self) -> None:
        comparison = compare_players("P001", "P101")
        self.assertIn(comparison.player_one, comparison.summary)
        self.assertIn(comparison.player_two, comparison.summary)
        self.assertIn(comparison.winner, {comparison.player_one, comparison.player_two, None})

    def test_report_mentions_sources(self) -> None:
        report = generate_player_summary("P102")
        self.assertIn("kaggle_indian_players", report.summary)
        self.assertEqual(len(report.strengths), 3)
        self.assertIn("PPI", report.summary)

    def test_turning_points_return_records(self) -> None:
        turning_points = detect_turning_points("ISL-2001")
        self.assertGreaterEqual(len(turning_points.turning_points), 1)

    def test_match_momentum_returns_bucketed_team_scores(self) -> None:
        momentum = get_match_momentum("SB-1001")
        self.assertGreaterEqual(len(momentum.buckets), 1)
        self.assertEqual(len(momentum.teams), 2)
        for bucket in momentum.buckets:
            self.assertEqual(len(bucket.scores), 2)

    def test_simulation_is_sorted(self) -> None:
        simulation = simulate_match("SB-1001")
        ordered_minutes = [tick.minute for tick in simulation.timeline]
        self.assertEqual(ordered_minutes, sorted(ordered_minutes))
        self.assertGreaterEqual(len(simulation.timeline), 1)

    def test_live_snapshot_uses_dynamic_match_context(self) -> None:
        match_events = get_match_events("SB-1001").sort_values(["minute", "second"]).reset_index(drop=True)
        live_window = match_events.iloc[:5].copy()
        ratings = []
        for player_id in live_window["player_id"].astype(str).tolist():
            snapshot = get_live_feature_snapshot(live_window, player_id)
            ratings.append(snapshot["overall_rating"])

        self.assertGreater(len(set(ratings)), 1)

    def test_match_event_data_is_coherent(self) -> None:
        match_events = get_match_events("SB-1001")
        teams = set(match_events["team"].unique())
        opponents = set(match_events["opponent"].unique())
        self.assertLessEqual(len(teams), 2)
        self.assertTrue(opponents.issubset(teams))

    def test_normalized_event_values_are_sanitized(self) -> None:
        events = load_all_events()
        self.assertTrue((events["minute"] >= 0).all())
        self.assertTrue(((events["second"] >= 0) & (events["second"] <= 59)).all())
        self.assertTrue((events["xg"] >= 0).all())

    def test_pressure_index_stays_within_supported_bounds(self) -> None:
        pressure = get_pressure_profile("P101")
        self.assertGreaterEqual(pressure.pressure_index, 0.5)
        self.assertLessEqual(pressure.pressure_index, 1.6)

    def test_api_returns_clean_not_found_error(self) -> None:
        response = self.client.get("/rating/UNKNOWN")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Player 'UNKNOWN' not found in analytics dataset")

    def test_health_endpoint_returns_dataset_context(self) -> None:
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn(payload["status"], {"ok", "degraded"})
        self.assertEqual(payload["service"], "playeriq-ai-service")
        self.assertIn("sources", payload)
        self.assertIn("warnings", payload)

    def test_simulation_endpoint_does_not_mix_extra_teams(self) -> None:
        response = self.client.post("/simulate/match/SB-1001")
        self.assertEqual(response.status_code, 200)
        teams = {tick["team"] for tick in response.json()["timeline"]}
        self.assertLessEqual(len(teams), 2)

    def test_momentum_endpoint_returns_graph_payload(self) -> None:
        response = self.client.get("/match/ISL-2001/momentum")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["matchId"], "ISL-2001")
        self.assertGreaterEqual(len(payload["buckets"]), 1)
        self.assertEqual(len(payload["teams"]), 2)

    def test_matches_endpoint_returns_match_list(self) -> None:
        response = self.client.get("/matches")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertGreaterEqual(len(payload["matches"]), 1)

    def test_training_dataset_export_has_required_columns(self) -> None:
        dataset = get_player_training_dataset()
        self.assertGreater(len(dataset), 0)
        for column in [
            "player_id",
            "player_name",
            "team",
            "position",
            "matches_played",
            "pass_accuracy",
            "xg_per_match",
            "pressure_index",
            "sample_overall_rating",
            "overall_rating",
            "target_label_version",
            "target_label_source",
        ]:
            self.assertIn(column, dataset.columns)

    def test_training_dataset_metadata_matches_export(self) -> None:
        dataset = get_player_training_dataset()
        metadata = get_player_training_dataset_metadata()
        self.assertEqual(metadata["row_count"], len(dataset))
        self.assertIn("overall_rating", metadata["target_columns"])
        self.assertIn("pressure_index", metadata["feature_columns"])
        self.assertEqual(metadata["target_label_version"], "heuristic_overall_rating_v1")

    def test_rating_model_training_produces_metrics(self) -> None:
        model, artifacts = train_player_rating_model()
        self.assertGreater(artifacts.row_count, 0)
        self.assertIn("mae", artifacts.metrics)
        self.assertIn("rmse", artifacts.metrics)
        self.assertIn("r2", artifacts.metrics)
        self.assertGreaterEqual(len(model.feature_importances_), 1)

    def test_rating_model_can_be_persisted_and_loaded(self) -> None:
        model_dir = Path(__file__).resolve().parents[2] / ".tmp_model_test"
        shutil.rmtree(model_dir, ignore_errors=True)
        model_dir.mkdir(parents=True, exist_ok=True)
        try:
            with patch("app.services.model_training._get_model_dir", return_value=model_dir):
                artifacts = train_and_persist_player_rating_model()
                self.assertTrue(artifacts.model_path.exists())
                self.assertTrue(artifacts.metadata_path.exists())
                model, metadata = load_player_rating_model()
                self.assertEqual(metadata["model_version"], "player_rating_rf_v1")
                dataset = get_player_training_dataset()
                feature_row = dataset.iloc[0].to_dict()
                prediction = predict_player_rating_from_features(feature_row, model=model)
                self.assertGreaterEqual(prediction, 0.0)
        finally:
            shutil.rmtree(model_dir, ignore_errors=True)

    def test_rating_model_retraining_archives_previous_artifacts(self) -> None:
        model_dir = Path(__file__).resolve().parents[2] / ".tmp_model_retrain_test"
        shutil.rmtree(model_dir, ignore_errors=True)
        model_dir.mkdir(parents=True, exist_ok=True)
        try:
            with patch("app.services.model_training._get_model_dir", return_value=model_dir):
                first_run = train_and_persist_player_rating_model()
                self.assertTrue(first_run.model_path.exists())
                retraining = retrain_and_persist_player_rating_model()
                self.assertTrue(retraining["archive"]["created"])
                self.assertTrue(Path(retraining["archive"]["archive_model_path"]).exists())
                self.assertTrue(Path(retraining["archive"]["archive_metadata_path"]).exists())
                self.assertTrue(Path(retraining["artifacts"]["model_path"]).exists())
                self.assertTrue(Path(retraining["artifacts"]["metadata_path"]).exists())
        finally:
            shutil.rmtree(model_dir, ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
