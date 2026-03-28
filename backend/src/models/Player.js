import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    playerId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    team: String,
    position: String,
    nationality: String,
    age: Number,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Player", playerSchema);

