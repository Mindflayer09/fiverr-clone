import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";

import authRoutes from "./routes/Auth.js";
import gigRoutes from "./routes/Gigs.js";
import orderRoutes from "./routes/order.js";
import messageRoutes from "./routes/messages.js";
import reviewRoutes from "./routes/reviews.js";
import uploadRoutes from "./routes/upload.js";
import Message from "./models/Message.js";
import ChatRoom from "./models/ChatRoom.js";
import chatroomRoutes from "./routes/chatRoom.js";

dotenv.config();

const REQUIRED_ENV_VARS = ["MONGO_URI", "JWT_SECRET", "PORT"];
for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chatrooms", chatroomRoutes); 

//  Get all chat rooms for a user with latest message
app.get("/api/chat/rooms/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const rooms = await ChatRoom.find({ participants: userId })
      .populate("participants", "username _id profilePic")
      .lean();

    for (let room of rooms) {
      const latestMessage = await Message.findOne({ roomId: room._id })
        .sort({ createdAt: -1 })
        .limit(1)
        .lean();

      room.latestMessage = latestMessage || null;
    }

    res.json(rooms);
  } catch (err) {
    console.error("❌ Failed to fetch chat rooms:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const { roomId, senderId, text } = req.body;

    if (!roomId || !senderId || !text) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newMessage = await Message.create({ roomId, senderId, text });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Message send error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("join", (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      console.log(`👤 User ${userId} joined`);
    }
  });

  socket.on("sendMessage", async ({ senderId, receiverId, content, roomId }) => {
    try {
      //  Validate input
      if (!senderId || !content || (!receiverId && !roomId)) {
        return socket.emit("errorMessage", "Invalid message data.");
      }

      let usedRoomId = roomId;

      //  If roomId not provided, create/find one-to-one chat
      if (!usedRoomId && receiverId) {
        const existingRoom = await ChatRoom.findOne({
          participants: { $all: [senderId, receiverId], $size: 2 },
        });

        if (existingRoom) {
          usedRoomId = existingRoom._id;
        } else {
          const newRoom = await ChatRoom.create({ participants: [senderId, receiverId] });
          usedRoomId = newRoom._id;
        }
      }

      //  No valid roomId found
      if (!usedRoomId) {
        return socket.emit("errorMessage", "Could not determine chat room.");
      }

      const newMsg = await Message.create({
        senderId,
        receiverId: receiverId || null,
        content,
        roomId: usedRoomId,
      });

      //  Send message to sender
      socket.emit("messageSaved", newMsg);

      //  Broadcast to all participants (like group chat)
      const room = await ChatRoom.findById(usedRoomId);
      if (room) {
        room.participants.forEach((participantId) => {
          const participantSocketId = onlineUsers.get(participantId.toString());
          if (participantSocketId && participantId.toString() !== senderId) {
            io.to(participantSocketId).emit("receiveMessage", newMsg);
          }
        });
      }
    } catch (err) {
      console.error("❌ Message send error:", err.message);
      socket.emit("errorMessage", "Server error: Could not send message.");
    }
  });

  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { from: senderId });
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((conn) => {
    console.log("✅ MongoDB connected:");
    console.log(`   ➤ Host: ${conn.connection.host}`);
    console.log(`   ➤ DB: ${conn.connection.name}`);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
