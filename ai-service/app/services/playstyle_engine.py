from functools import lru_cache
import os

import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

from app.schemas.analytics import PlaystyleResponse
from app.services.feature_engineering import get_feature_matrix_for_clustering, get_player_features

os.environ.setdefault("LOKY_MAX_CPU_COUNT", "1")

PLAYSTYLE_FEATURES = [
    "pass_accuracy",
    "key_passes_per_match",
    "progressive_passes_per_match",
    "shots_per_match",
    "xg_per_match",
    "dribbles_completed_per_match",
    "defensive_actions_per_match",
    "recoveries_per_match",
]


def _cluster_role_score(row: pd.Series, role: str) -> float:
    scores = {
        "Playmaker": (
            row["pass_accuracy"] * 3.2
            + row["key_passes_per_match"] * 3.0
            + row["progressive_passes_per_match"] * 2.2
            - row["shots_per_match"] * 0.4
        ),
        "Striker": row["shots_per_match"] * 3.0 + row["xg_per_match"] * 14.0 - row["defensive_actions_per_match"] * 0.6,
        "Defender": (
            row["defensive_actions_per_match"] * 3.0
            + row["recoveries_per_match"] * 1.8
            - row["dribbles_completed_per_match"] * 0.4
        ),
        "Box-to-box": (
            row["defensive_actions_per_match"] * 1.8
            + row["progressive_passes_per_match"] * 1.6
            + row["recoveries_per_match"] * 1.5
            + row["shots_per_match"] * 0.8
        ),
        "Winger": (
            row["dribbles_completed_per_match"] * 3.2
            + row["shots_per_match"] * 1.4
            + row["progressive_passes_per_match"] * 1.1
            - row["recoveries_per_match"] * 0.2
        ),
    }
    return scores[role]


def _supporting_traits(player_row: pd.Series, population: pd.DataFrame) -> list[str]:
    metrics = {
        "elite chance creation": player_row["key_passes_per_match"] - population["key_passes_per_match"].mean(),
        "secure ball progression": player_row["pass_accuracy"] - population["pass_accuracy"].mean(),
        "direct attacking threat": player_row["shots_per_match"] - population["shots_per_match"].mean(),
        "1v1 carry value": player_row["dribbles_completed_per_match"] - population["dribbles_completed_per_match"].mean(),
        "defensive coverage": player_row["defensive_actions_per_match"] - population["defensive_actions_per_match"].mean(),
        "recovery intensity": player_row["recoveries_per_match"] - population["recoveries_per_match"].mean(),
    }
    return [label for label, _ in sorted(metrics.items(), key=lambda item: item[1], reverse=True)[:3]]


@lru_cache(maxsize=1)
def _build_cluster_artifacts() -> tuple[pd.DataFrame, KMeans, StandardScaler, dict[int, str]]:
    feature_table = get_feature_matrix_for_clustering().copy()
    cluster_count = min(5, len(feature_table))
    scaler = StandardScaler()
    matrix = scaler.fit_transform(feature_table[PLAYSTYLE_FEATURES])
    model = KMeans(n_clusters=cluster_count, random_state=7, n_init="auto")
    feature_table["cluster"] = model.fit_predict(matrix)

    centroids = pd.DataFrame(scaler.inverse_transform(model.cluster_centers_), columns=PLAYSTYLE_FEATURES)
    cluster_label_map = {}
    for cluster_id, row in centroids.iterrows():
        candidate_scores = {
            role: _cluster_role_score(row, role)
            for role in ["Playmaker", "Striker", "Defender", "Box-to-box", "Winger"]
        }
        cluster_label_map[cluster_id] = max(candidate_scores, key=candidate_scores.get)

    return feature_table, model, scaler, cluster_label_map


def get_playstyle_profile(player_id: str) -> PlaystyleResponse:
    feature_table, model, scaler, cluster_label_map = _build_cluster_artifacts()
    player = get_player_features(player_id)
    player_row = feature_table.loc[feature_table["player_id"] == player_id]
    if player_row.empty:
        raise KeyError(f"Player '{player_id}' not found in playstyle dataset")

    transformed = scaler.transform(player_row[PLAYSTYLE_FEATURES])
    distances = model.transform(transformed)[0]
    cluster_id = int(player_row.iloc[0]["cluster"])
    playstyle = cluster_label_map[cluster_id]
    traits = _supporting_traits(player_row.iloc[0], feature_table)
    max_distance = max(float(distances.max()), 1e-6)
    distance = round(float(distances[cluster_id]) / max_distance, 2)

    return PlaystyleResponse(
        player_id=player["player_id"],
        playstyle=playstyle,
        cluster_distance=distance,
        supporting_traits=traits,
    )
