import { fetchPlayerComparison } from "./ai.service.js";

const buildPlayerSummary = (playerId, playerName) => ({
  playerId,
  name: playerName,
});

export const shapePlayerComparisonData = (player1, player2, comparison) => {
  const winnerId =
    comparison.winner === comparison.playerOne
      ? player1
      : comparison.winner === comparison.playerTwo
        ? player2
        : null;

  return {
    players: {
      playerOne: buildPlayerSummary(player1, comparison.playerOne),
      playerTwo: buildPlayerSummary(player2, comparison.playerTwo),
    },
    winner: comparison.winner ? buildPlayerSummary(winnerId, comparison.winner) : null,
    summary: comparison.summary,
    radar: comparison.radar,
  };
};

export const getPlayerComparisonData = async (player1, player2) => {
  const comparison = await fetchPlayerComparison(player1, player2);
  return shapePlayerComparisonData(player1, player2, comparison);
};
