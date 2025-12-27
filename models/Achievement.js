import mongoose from "mongoose";

const AchievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },

  certificateUrl: { type: String }, // PDF / Image URL

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Achievement", AchievementSchema);
