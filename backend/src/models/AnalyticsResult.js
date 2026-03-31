import mongoose from "mongoose";

const analyticsResultSchema = new mongoose.Schema(
  {
    playerId: {
      type: String,
      index: true,
    },
    recordType: {
      type: String,
      enum: ["player-profile", "comparison", "match-analysis"],
      default: "player-profile",
      index: true,
    },
    cacheKey: {
      type: String,
      index: true,
    },
    snapshotType: {
      type: String,
    },
    players: {
      type: [String],
      default: [],
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    playerSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    overview: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    analytics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    matchId: String,
    season: String,
    overallRating: Number,
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    playstyle: String,
    ppi: Number,
    pressureIndex: Number,
    report: String,
    comparisonCache: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timeSeries: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

analyticsResultSchema.index({ recordType: 1, playerId: 1 });
analyticsResultSchema.index({ recordType: 1, cacheKey: 1 });
analyticsResultSchema.index({ recordType: 1, matchId: 1, snapshotType: 1 });

export default mongoose.model("AnalyticsResult", analyticsResultSchema);
