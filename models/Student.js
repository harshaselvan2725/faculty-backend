import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  data: {
    type: Object, // dynamic fields
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Student", StudentSchema);
