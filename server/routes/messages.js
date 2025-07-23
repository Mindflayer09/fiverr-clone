import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

/**
 * @route   POST /api/messages
 * @desc    Create a new message (optional if using socket.io)
 */
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, content, roomId } = req.body;

    if (!senderId || !receiverId || !content || !roomId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newMessage = await Message.create({ senderId, receiverId, content, roomId });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Failed to create message:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route   GET /api/messages/:roomId
 * @desc    Get all messages from a specific chat room
 */
router.get("/:roomId", async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ createdAt: 1 })
      .populate("senderId", "username profilePic")  // optional
      .populate("receiverId", "username profilePic"); // optional

    res.status(200).json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route   DELETE /api/messages/:id
 * @desc    Delete a message by ID (optional)
 */
router.delete("/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.error("Failed to delete message:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
