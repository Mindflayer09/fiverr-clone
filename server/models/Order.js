import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in progress", "completed", "cancelled"],
      default: "pending",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    deliveryFiles: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
      },
    ],
    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
    },
    hasReviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// indexes for performance
orderSchema.index({ buyerId: 1 });
orderSchema.index({ sellerId: 1 });
orderSchema.index({ gigId: 1 });

export default mongoose.model("Order", orderSchema);