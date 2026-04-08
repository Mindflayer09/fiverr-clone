// models/Gig.js
import mongoose from "mongoose";

const GigSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: { type: [String], required: true },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Gig", GigSchema);
