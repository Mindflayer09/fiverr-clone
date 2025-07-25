import express from "express";
import Gig from "../models/Gig.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// CREATE a new Gig
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, category, price, images } = req.body;
    const newGig = new Gig({
      userId: req.user.id,
      title,
      description,
      category,
      price,
      images,
    });
    const savedGig = await newGig.save();
    console.log("✅ New gig created:", savedGig._id);
    res.status(201).json(savedGig);
  } catch (err) {
    console.error("❌ Gig creation failed:", err.message);
    res.status(500).json({ message: "Server error creating gig." });
  }
});

// GET all Gigs (for the explore section)
router.get("/", async (req, res) => {
  try {
    const gigs = await Gig.find().populate("userId", "username profilePicture");
    res.status(200).json(gigs);
  } catch (err) {
    console.error("❌ Failed to fetch gigs:", err.message);
    res.status(500).json({ message: "Server error fetching gigs." });
  }
});

// GET a single Gig by ID
router.get("/:id", async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate(
      "userId",
      "username profilePicture"
    );
    if (!gig) {
      return res.status(404).json({ message: "Gig not found." });
    }
    res.status(200).json(gig);
  } catch (err) {
    console.error("❌ Failed to fetch gig:", err.message);
    res.status(500).json({ message: "Server error fetching gig." });
  }
});

// ✅ New Route: GET all gigs for a specific user
router.get("/user/:id", verifyToken, async (req, res) => {
  try {
    const gigs = await Gig.find({ userId: req.params.id }).populate("userId", "username");
    res.status(200).json(gigs);
  } catch (err) {
    console.error("❌ Failed to fetch user's gigs:", err.message);
    res.status(500).json({ message: "Server error fetching user's gigs." });
  }
});


// UPDATE a Gig by ID
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const gigId = req.params.id;
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found." });
    }
    if (gig.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to update this gig." });
    }

    const updatedGig = await Gig.findByIdAndUpdate(gigId, req.body, {
      new: true,
    });
    console.log("✅ Gig updated:", updatedGig._id);
    res.status(200).json(updatedGig);
  } catch (err) {
    console.error("❌ Failed to update gig:", err.message);
    res.status(500).json({ message: "Server error updating gig." });
  }
});

// DELETE a Gig (with a check for existing orders)
router.delete("/:id", verifyToken, async (req, res) => {
  const gigId = req.params.id;

  try {
    const existingOrder = await Order.findOne({ gigId });
    if (existingOrder) {
      return res.status(409).json({
        message: "Cannot delete this gig. Orders have been placed against it.",
      });
    }
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found." });
    }
    if (gig.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this gig." });
    }
    await Gig.findByIdAndDelete(gigId);
    console.log("✅ Gig deleted:", gigId);
    res.status(200).json({ message: "Gig deleted successfully." });
  } catch (err) {
    console.error("❌ Gig deletion failed:", err.message);
    res.status(500).json({ message: "Server error during gig deletion." });
  }
});

export default router;