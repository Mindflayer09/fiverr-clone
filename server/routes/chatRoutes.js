import express from "express";
import ChatRoom from "../models/ChatRoom.js"; // Assuming this is your ChatRoom model
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
        archivedBy: [], 
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
    const { roomId } = req.params;
    const userId = req.user.id; 

    const chatRoom = await ChatRoom.findById(roomId); 
    if (chatRoom && chatRoom.archivedBy.includes(userId)) {
      return res.status(200).json([]);
    }

    const messages = await Message.find({ room: roomId })
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
      room: roomId,
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

// ✅ RE-ADDED: DELETE all messages for a specific room
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

router.put("/archive/:orderId", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const chatRoom = await ChatRoom.findOneAndUpdate(
      { orderId: orderId },
      { $addToSet: { archivedBy: userId } },
      { new: true }
    );

    if (!chatRoom) {
      return res.status(404).json({ message: "Chat room not found." });
    }

    console.log(`✅ Chat room ${orderId} archived for user ${userId}.`);
    res.status(200).json({ message: "Chat history archived successfully." });
  } catch (err) {
    console.error("❌ Error archiving chat history:", err.message);
    res.status(500).json({ message: "Server error archiving chat history." });
  }
});

export default router;