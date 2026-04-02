import { useEffect, useState } from "react";

import { getPlayerComparison, getPlayers } from "../api/client.js";
import ComparisonRadar from "../components/ComparisonRadar.jsx";
import { SHOWCASE_PLAYERS } from "../config/showcase.js";

export default function ComparisonPage() {
  const [players, setPlayers] = useState([]);
  const [selection, setSelection] = useState({
    player1: SHOWCASE_PLAYERS.compareA.id,
    player2: SHOWCASE_PLAYERS.compareB.id,
  });
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    getPlayers().then((payload) => setPlayers(payload.players || [])).catch(() => setPlayers([]));
  }, []);

  useEffect(() => {
    if (!selection.player1 || !selection.player2 || selection.player1 === selection.player2) {
      setComparison(null);
      return;
    }

    getPlayerComparison(selection.player1, selection.player2).then(setComparison).catch(() => setComparison(null));
  }, [selection.player1, selection.player2]);

  const playerOneName = comparison?.playerOne || players.find((player) => player.playerId === selection.player1)?.playerName;
  const playerTwoName = comparison?.playerTwo || players.find((player) => player.playerId === selection.player2)?.playerName;

  return (
    <div className="page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Player Comparison</p>
            <h2>
              {playerOneName || "Player One"} vs {playerTwoName || "Player Two"}
            </h2>
          </div>
        </div>
        <p className="summary-copy">
          Put two players side by side and get a quick feel for who is shaping games better right now.
        </p>

        <div className="selector-grid">
          <select
            className="selector-input"
            value={selection.player1}
            onChange={(event) => setSelection((current) => ({ ...current, player1: event.target.value }))}
          >
            {players.map((player) => (
              <option key={player.playerId} value={player.playerId}>
                {player.playerName} - {player.team}
              </option>
            ))}
          </select>

          <select
            className="selector-input"
            value={selection.player2}
            onChange={(event) => setSelection((current) => ({ ...current, player2: event.target.value }))}
          >
            {players.map((player) => (
              <option key={player.playerId} value={player.playerId}>
                {player.playerName} - {player.team}
              </option>
            ))}
          </select>
        </div>
      </section>

      <ComparisonRadar comparison={comparison} />
    </div>
  );
}
