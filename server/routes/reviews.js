import express from "express";
import Review from "../models/Review.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ✅ POST /reviews → Add a review
router.post("/", verifyToken, async (req, res) => {
  const { gigId, rating, comment } = req.body;
  const userId = req.user.id;

  try {
    // Prevent duplicate reviews
    const existing = await Review.findOne({ gigId, userId });
    if (existing) return res.status(400).json({ message: "You already reviewed this gig." });

    const newReview = new Review({ gigId, userId, rating, comment });
    await newReview.save();

    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//  GET /reviews/:gigId → Get all reviews for a gig
router.get("/:gigId", async (req, res) => {
  try {
    const reviews = await Review.find({ gigId: req.params.gigId })
      .populate("userId", "username avatar") //  get username + avatar
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});


export default router;
