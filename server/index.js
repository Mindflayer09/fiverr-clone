import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http"; // For socket.io
import { Server } from "socket.io";

// ✅ Import Routes
import authRoutes from "./routes/Auth.js";
import gigRoutes from "./routes/gigs.js";
import orderRoutes from "./routes/order.js";
import messageRoutes from "./routes/messages.js";

// ✅ Load .env
dotenv.config();

// ✅ Express app
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("API is working...");
});

// ✅ Create HTTP server for socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Track online users
const onlineUsers = new Map();

// ✅ Socket.io logic
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // User joins (register socket ID)
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    console.log("✅ User joined:", userId);
  });

  // Handle message sending
  socket.on("sendMessage", (msg) => {
    const receiverSocketId = onlineUsers.get(msg.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", msg);
    }
  });

  // Typing indicator
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { from: socket.id });
    }
  });

  // User disconnects
  socket.on("disconnect", () => {
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    console.log("❌ Disconnected:", socket.id);
  });
});

// ✅ Connect to DB and launch server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running at http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
