import { fetchPlayerComparison } from "./ai.service.js";
import { getCachedComparison, saveComparisonCache } from "./analytics-cache.service.js";

const buildPlayerSummary = (playerId, playerName) => ({
  playerId,
  name: playerName,
});

const getCategoryWinner = (metric, playerOneScore, playerTwoScore) => {
  if (playerOneScore === playerTwoScore) {
    return {
      metric,
      winner: null,
      margin: 0,
    };
  }

  return {
    metric,
    winner: playerOneScore > playerTwoScore ? "playerOne" : "playerTwo",
    margin: Math.abs(playerOneScore - playerTwoScore),
  };
};

export const shapePlayerComparisonData = (player1, player2, comparison) => {
  const categoryWinners = comparison.radar.map((point) =>
    getCategoryWinner(point.metric, point.playerOne, point.playerTwo),
  );
  const playerOneWins = categoryWinners.filter((item) => item.winner === "playerOne");
  const playerTwoWins = categoryWinners.filter((item) => item.winner === "playerTwo");
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
    scorecards: {
      playerOne: {
        metricsWon: playerOneWins.length,
        strongestEdges: playerOneWins.map((item) => item.metric),
      },
      playerTwo: {
        metricsWon: playerTwoWins.length,
        strongestEdges: playerTwoWins.map((item) => item.metric),
      },
    },
    categoryWinners,
  };
};

export const getPlayerComparisonData = async (player1, player2) => {
  try {
    const comparison = await fetchPlayerComparison(player1, player2);
    const shaped = shapePlayerComparisonData(player1, player2, comparison);
    await saveComparisonCache(player1, player2, shaped).catch(() => undefined);
    return shaped;
  } catch (error) {
    const cached = await getCachedComparison(player1, player2).catch(() => null);
    if (cached) {
      return cached;
    }
    throw error;
  }
};
