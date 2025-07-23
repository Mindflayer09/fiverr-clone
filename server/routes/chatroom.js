import express from "express";
import ChatRoom from "../models/ChatRoom.js";

const router = express.Router();

// Get all chat rooms for a specific user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const rooms = await ChatRoom.find({ participants: userId })
      .populate("participants", "_id username profilePicture");
      
    res.status(200).json(rooms);
  } catch (err) {
    console.error("Error fetching chat rooms:", err.message);
    res.status(500).json({ error: "Failed to fetch chat rooms" });
  }
});

// Create or return existing chat room between two users
router.post("/", async (req, res) => {
  const { userA, userB } = req.body;

  if (!userA || !userB) {
    return res.status(400).json({ error: "Both participants are required" });
  }

  try {
    // Check if room already exists
    let room = await ChatRoom.findOne({
      participants: { $all: [userA, userB], $size: 2 }
    });

    // If not found, create it
    if (!room) {
      room = new ChatRoom({ participants: [userA, userB] });
      await room.save();
    }

    res.status(200).json(room);
  } catch (err) {
    console.error("Error creating or finding chat room:", err.message);
    res.status(500).json({ error: "Failed to create or find chat room" });
  }
});

export default router;
