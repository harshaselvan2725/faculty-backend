import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  columns: {
    type: [String],
    default: ["registerNo", "name", "phone"],
  },
});

export default mongoose.model("Class", ClassSchema);
