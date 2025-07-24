import express from "express";
import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Get or create chat room by orderId
router.get("/room/:orderId", verifyToken, async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  try {
    let room = await ChatRoom.findOne({ orderId });

    if (!room) {
      room = await ChatRoom.create({
        orderId,
        participants: [userId],
      });
      console.log(`✅ New chat room created for order ${orderId} with participant ${userId}`);
    } else if (!room.participants.includes(userId)) {
      room.participants.push(userId);
      await room.save();
      console.log(`✅ User ${userId} added to existing chat room for order ${orderId}`);
    } else {
      console.log(`ℹ️ User ${userId} already in chat room for order ${orderId}`);
    }

    res.status(200).json(room);
  } catch (err) {
    console.error("❌ Error in /room/:orderId route:", err.message);
    res.status(500).json({ message: "Server error getting or creating chat room" });
  }
});

// Get messages by room ID
router.get("/messages/:roomId", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId }) // ✅ Corrected from chatRoom to room
      .populate("sender", "username profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error("❌ Error fetching messages:", err.message);
    res.status(500).json({ message: "Server error fetching messages" });
  }
});

// Send a message
router.post("/message", verifyToken, async (req, res) => {
  const { roomId, text } = req.body;
  const senderId = req.user.id; 

  try {
    const message = await Message.create({
      room: roomId, // ✅ Corrected from chatRoom to room
      sender: senderId,
      text,
    });

    const populated = await message.populate("sender", "username profilePic");
    res.status(201).json(populated);
  } catch (err) {
    console.error("❌ Error sending message:", err.message);
    res.status(500).json({ message: "Server error sending message" });
  }
});

// ✅ NEW: DELETE all messages for a specific room
router.delete("/messages/:roomId", verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    await Message.deleteMany({ room: roomId });

    console.log(`✅ All messages for room ${roomId} deleted.`);
    res.status(200).json({ message: "Chat history deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting chat history:", err.message);
    res.status(500).json({ message: "Server error deleting chat history." });
  }
});

export default router;