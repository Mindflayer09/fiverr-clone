import express from "express";
import Gig from "../models/Gig.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * @route   GET /api/gigs
 * @desc    Get all gigs
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const gigs = await Gig.find();
    res.status(200).json(gigs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch gigs", error: err.message });
  }
});

/**
 * @route   POST /api/gigs
 * @desc    Create a new gig
 * @access  Private
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, price, images } = req.body;

    if (!title || !description || !price || !images?.length) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newGig = new Gig({
      title,
      description,
      price,
      images,
      userId: req.user.id, // ✅ THIS WAS THE BUG
    });

    const savedGig = await newGig.save();
    res.status(201).json(savedGig);
  } catch (err) {
    res.status(500).json({ message: "Failed to create gig", error: err.message });
  }
});

/**
 * @route   GET /api/gigs/user/:userId
 * @desc    Get gigs by user ID
 * @access  Public or Private (depending on need)
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const gigs = await Gig.find({ userId: req.params.userId });
    res.status(200).json(gigs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch gigs", error: err.message });
  }
});

/**
 * @route   GET /api/gigs/:id
 * @desc    Get single gig by ID
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    res.status(200).json(gig);
  } catch (err) {
    res.status(500).json({ message: "Failed to get gig", error: err.message });
  }
});

/**
 * @route   DELETE /api/gigs/:id
 * @desc    Delete a gig by ID
 * @access  Private (only owner can delete)
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    if (gig.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to delete this gig" });
    }

    await gig.deleteOne();
    res.status(200).json({ message: "Gig deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete gig", error: err.message });
  }
});

export default router;
