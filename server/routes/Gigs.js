import express from "express";
import Gig from "../models/Gig.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// CREATE
router.post("/", verifyToken, async (req, res) => {
  try {
    const gig = new Gig({ ...req.body, userId: req.userId });
    await gig.save();
    res.status(201).json(gig);
  } catch (err) {
    res.status(500).json({ error: "Failed to create gig" });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  try {
    const gigs = await Gig.find();
    res.status(200).json(gigs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch gigs" });
  }
});

// GET gigs by user ID
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const gigs = await Gig.find({ userId: req.params.userId });
    res.status(200).json(gigs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user gigs" });
  }
});

// READ ONE
router.get("/:id", async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    res.status(200).json(gig);
  } catch (err) {
    res.status(404).json({ error: "Gig not found" });
  }
});

// UPDATE gig (only if owner)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) return res.status(404).json({ error: "Gig not found" });
    if (gig.userId.toString() !== req.userId)
      return res.status(403).json({ error: "Unauthorized" });

    const updatedGig = await Gig.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json(updatedGig);
  } catch (err) {
    res.status(500).json({ error: "Failed to update gig" });
  }
});

// DELETE gig (only if owner)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) return res.status(404).json({ error: "Gig not found" });
    if (gig.userId.toString() !== req.userId)
      return res.status(403).json({ error: "Unauthorized" });

    await gig.deleteOne();
    res.status(200).json({ message: "Gig deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete gig" });
  }
});


export default router;
