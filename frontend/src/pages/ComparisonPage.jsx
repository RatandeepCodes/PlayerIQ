import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getPlayerComparison, getPlayers } from "../api/client.js";
import AppStatusScreen from "../components/AppStatusScreen.jsx";
import ComparisonRadar from "../components/ComparisonRadar.jsx";
import { SHOWCASE_PLAYERS } from "../config/showcase.js";

const defaultSelection = {
  player1: SHOWCASE_PLAYERS.compareA.id,
  player2: SHOWCASE_PLAYERS.compareB.id,
};

export default function ComparisonPage() {
  const [directory, setDirectory] = useState([]);
  const [selection, setSelection] = useState(defaultSelection);
  const [comparison, setComparison] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDirectory = async () => {
      try {
        const response = await getPlayers({ limit: 100 });
        if (!active) {
          return;
        }

        setDirectory(response.players || []);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(requestError?.message || "Unable to load player options right now.");
      }
    };

    loadDirectory();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadComparison = async () => {
      setError("");

      if (!selection.player1 || !selection.player2 || selection.player1 === selection.player2) {
        setComparison(null);
        setLoading(false);
        return;
      }

      if (!comparison) {
        setLoading(true);
      } else {
        setReloading(true);
      }

      try {
        const payload = await getPlayerComparison(selection.player1, selection.player2);
        if (!active) {
          return;
        }

        setComparison(payload);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setComparison(null);
        setError(requestError?.message || "Unable to compare these players right now.");
      } finally {
        if (active) {
          setLoading(false);
          setReloading(false);
        }
      }
    };

    loadComparison();

    return () => {
      active = false;
    };
  }, [selection.player1, selection.player2]);

  const directoryById = useMemo(
    () =>
      Object.fromEntries(
        directory.map((player) => [player.playerId, player]),
      ),
    [directory],
  );
  const filteredDirectory = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return directory;
    }

    return directory.filter((player) =>
      [player.name, player.team, player.position, player.nationality]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [directory, search]);

  if (loading && !comparison) {
    return (
      <AppStatusScreen
        eyebrow="Comparison"
        title="Loading comparison board"
        message="PlayerIQ is pulling the player list and building the live head-to-head view."
      />
    );
  }

  if (!directory.length && error) {
    return (
      <AppStatusScreen
        eyebrow="Comparison"
        title="The comparison board is unavailable right now"
        message={error}
        tone="error"
      />
    );
  }

  const playerOne = comparison?.players?.playerOne;
  const playerTwo = comparison?.players?.playerTwo;
  const sameSelection = Boolean(selection.player1 && selection.player1 === selection.player2);

  return (
    <div className="page comparison-page">
      <section className="panel comparison-selector-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Player Comparison</p>
            <h2>Pick two players and compare them live</h2>
          </div>
          {reloading ? <span className="live-pill">Refreshing matchup</span> : null}
        </div>

        <div className="comparison-selector-grid">
          <label className="comparison-field comparison-search-field">
            <span>Search players</span>
            <input
              className="selector-search-input"
              type="text"
              placeholder="Search by name, club, or position"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label className="comparison-field">
            <span>Player One</span>
            <select
              value={selection.player1}
              onChange={(event) => setSelection((current) => ({ ...current, player1: event.target.value }))}
              disabled={!filteredDirectory.length}
            >
              {filteredDirectory.map((player) => (
                <option key={player.playerId} value={player.playerId}>
                  {player.name} - {player.team}
                </option>
              ))}
            </select>
          </label>

          <button
            className="comparison-swap"
            type="button"
            onClick={() => setSelection((current) => ({ player1: current.player2, player2: current.player1 }))}
            disabled={!selection.player1 || !selection.player2}
          >
            Swap
          </button>

          <label className="comparison-field">
            <span>Player Two</span>
            <select
              value={selection.player2}
              onChange={(event) => setSelection((current) => ({ ...current, player2: event.target.value }))}
              disabled={!filteredDirectory.length}
            >
              {filteredDirectory.map((player) => (
                <option key={player.playerId} value={player.playerId}>
                  {player.name} - {player.team}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? <p className="auth-error comparison-inline-error">{error}</p> : null}
        {sameSelection ? (
          <p className="comparison-helper-copy">Pick two different players to unlock the live head-to-head view.</p>
        ) : null}
      </section>

      {comparison ? (
        <>
          <section className="comparison-hero-grid">
            <article className="panel comparison-player-card">
              <p className="eyebrow">Player One</p>
              <h3>{playerOne?.name}</h3>
              <p className="summary-copy">
                {(directoryById[playerOne?.playerId]?.team || "Team unavailable")}{" "}
                <span className="dashboard-meta-separator">|</span>{" "}
                {(directoryById[playerOne?.playerId]?.nationality || "Global")}
              </p>
              <div className="comparison-score-stack">
                <span>Metrics won</span>
                <strong>{comparison.scorecards.playerOne.metricsWon}</strong>
              </div>
              <Link className="secondary-link" to={`/player/${playerOne?.playerId}`}>
                Open player page
              </Link>
            </article>

            <article className="panel comparison-summary-card">
              <p className="eyebrow">Headline</p>
              <h2>{comparison.winner ? `${comparison.winner.name} has the edge` : "This matchup is finely balanced"}</h2>
              <p className="summary-copy">{comparison.summary}</p>
            </article>

            <article className="panel comparison-player-card">
              <p className="eyebrow">Player Two</p>
              <h3>{playerTwo?.name}</h3>
              <p className="summary-copy">
                {(directoryById[playerTwo?.playerId]?.team || "Team unavailable")}{" "}
                <span className="dashboard-meta-separator">|</span>{" "}
                {(directoryById[playerTwo?.playerId]?.nationality || "Global")}
              </p>
              <div className="comparison-score-stack">
                <span>Metrics won</span>
                <strong>{comparison.scorecards.playerTwo.metricsWon}</strong>
              </div>
              <Link className="secondary-link" to={`/player/${playerTwo?.playerId}`}>
                Open player page
              </Link>
            </article>
          </section>

          <ComparisonRadar
            radar={comparison.radar}
            playerOneName={playerOne?.name}
            playerTwoName={playerTwo?.name}
          />

          <section className="page-grid comparison-detail-grid">
            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Winning Areas</p>
                  <h2>Where the edge comes from</h2>
                </div>
              </div>

              <div className="comparison-category-list">
                {comparison.categoryWinners.map((item) => (
                  <article key={item.metric} className="comparison-category-item">
                    <strong>{item.metric}</strong>
                    <span>
                      {item.winner === "playerOne"
                        ? playerOne?.name
                        : item.winner === "playerTwo"
                          ? playerTwo?.name
                          : "Level"}
                    </span>
                    <small>Margin {item.margin}</small>
                  </article>
                ))}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Quick Read</p>
                  <h2>What the matchup says</h2>
                </div>
              </div>

              <div className="comparison-bullet-columns">
                <div>
                  <h3>{playerOne?.name}</h3>
                  <div className="profile-bullet-list">
                    {(comparison.scorecards.playerOne.strongestEdges || []).length ? (
                      comparison.scorecards.playerOne.strongestEdges.map((item) => (
                        <div key={item} className="profile-bullet-item">
                          <span className="profile-bullet-dot" />
                          <p>{item}</p>
                        </div>
                      ))
                    ) : (
                      <p className="summary-copy">No clear winning categories in this matchup.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3>{playerTwo?.name}</h3>
                  <div className="profile-bullet-list">
                    {(comparison.scorecards.playerTwo.strongestEdges || []).length ? (
                      comparison.scorecards.playerTwo.strongestEdges.map((item) => (
                        <div key={item} className="profile-bullet-item">
                          <span className="profile-bullet-dot profile-bullet-dot-muted" />
                          <p>{item}</p>
                        </div>
                      ))
                    ) : (
                      <p className="summary-copy">No clear winning categories in this matchup.</p>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </section>
        </>
      ) : (
        <section className="panel empty-state">
          <p className="eyebrow">Comparison</p>
          <h2>Choose two different players to begin.</h2>
          <p className="summary-copy">
            The live radar, headline edge, and category winners will appear as soon as both players are ready.
          </p>
        </section>
      )}
    </div>
  );
}
