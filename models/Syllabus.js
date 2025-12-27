import mongoose from "mongoose";

const SyllabusSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    // 🔗 Reference to GridFS file
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    filename: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

export default mongoose.model("Syllabus", SyllabusSchema);
