// server/routes/messages.js
import express from "express";
import Message from "../models/Message.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Send + save message
router.post("/", verifyToken, async (req, res) => {
  try {
    const message = await Message.create(req.body);
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ msg: "Failed to send message" });
  }
});

// Get chat history between two users
router.get("/:user1/:user2", verifyToken, async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch messages" });
  }
});

export default router;
