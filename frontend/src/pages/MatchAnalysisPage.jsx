import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMatchAnalysis, getMatches } from "../api/client.js";
import MomentumChart from "../components/MomentumChart.jsx";

export default function MatchAnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    getMatches().then((payload) => setMatches(payload.matches || [])).catch(() => setMatches([]));
  }, []);

  useEffect(() => {
    getMatchAnalysis(id).then(setAnalysis).catch(() => setAnalysis(null));
  }, [id]);

  const currentMatch = matches.find((match) => match.matchId === id);

  return (
    <div className="page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Match Day</p>
            <h2>{analysis?.title || currentMatch?.title || "Match Story"}</h2>
          </div>
          <div className="live-pill">{currentMatch?.competition || "Football"}</div>
        </div>
        <p className="summary-copy">
          Follow the flow of the game, spot the biggest swings, and understand how the match story changed minute by minute.
        </p>

        <div className="selector-row">
          <select
            className="selector-input"
            value={id}
            onChange={(event) => navigate(`/matches/${event.target.value}`)}
          >
            {matches.map((match) => (
              <option key={match.matchId} value={match.matchId}>
                {match.title} - {match.competition}
              </option>
            ))}
          </select>
        </div>
      </section>

      <MomentumChart analysis={analysis} title={analysis?.title || currentMatch?.title || "Match Story"} />

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Key Moments</p>
            <h2>Where the match changed</h2>
          </div>
        </div>

        <div className="turning-point-list">
          {(analysis?.turningPoints || []).map((point) => (
            <article key={point.minute} className="turning-point">
              <strong>{point.minute}'</strong>
              <span>{point.note}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
