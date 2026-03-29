import { fetchPlayerComparison } from "./ai.service.js";

const buildPlayerSummary = (playerId, playerName) => ({
  playerId,
  name: playerName,
});

export const getPlayerComparisonData = async (player1, player2) => {
  const comparison = await fetchPlayerComparison(player1, player2);
  const winnerId = comparison.winner === comparison.playerOne ? player1 : player2;

  return {
    players: {
      playerOne: buildPlayerSummary(player1, comparison.playerOne),
      playerTwo: buildPlayerSummary(player2, comparison.playerTwo),
    },
    winner: buildPlayerSummary(winnerId, comparison.winner),
    summary: comparison.summary,
    radar: comparison.radar,
  };
};
