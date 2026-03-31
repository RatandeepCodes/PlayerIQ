import unittest

from fastapi.testclient import TestClient

from app.main import app
from app.services.comparison_engine import compare_players
from app.services.data_repository import get_dataset_summary, get_match_events, list_players, load_all_events
from app.services.feature_engineering import get_live_feature_snapshot
from app.services.momentum_engine import get_match_momentum
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

    def test_player_directory_flags_indian_players(self) -> None:
        players = list_players()
        indian_players = [player for player in players.players if player.is_indian]
        self.assertGreaterEqual(len(indian_players), 4)

    def test_rating_output_is_bounded(self) -> None:
        rating = get_player_rating("P101")
        self.assertGreaterEqual(rating.overall_rating, 0)
        self.assertLessEqual(rating.overall_rating, 100)
        self.assertEqual(rating.nationality, "India")
        self.assertIn("kaggle_indian_players", rating.sources)

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


if __name__ == "__main__":
    unittest.main()
