import mongoose from "mongoose";

const AchievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },

    // 🔗 GRIDFS REFERENCES (LIKE SYLLABUS)
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Achievement", AchievementSchema);
