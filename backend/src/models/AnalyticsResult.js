import mongoose from "mongoose";

const analyticsResultSchema = new mongoose.Schema(
  {
    playerId: {
      type: String,
      required: true,
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

export default mongoose.model("AnalyticsResult", analyticsResultSchema);

