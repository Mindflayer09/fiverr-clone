import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import path from "path";
import { Server } from "socket.io";

// Route imports
import authRoutes from "./routes/auth.js";
import gigRoutes from "./routes/gigs.js";
import orderRoutes from "./routes/order.js";
import reviewRoutes from "./routes/reviews.js";
import uploadRoutes from "./routes/upload.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Environment Check
const REQUIRED_ENV_VARS = ["MONGO_URI", "JWT_SECRET", "PORT"];
for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

// Middlewares
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
console.log("🔗 Mounted: /api/auth");

app.use("/api/gigs", gigRoutes);
console.log("🔗 Mounted: /api/gigs");

app.use("/api/orders", orderRoutes);
console.log("🔗 Mounted: /api/orders");

app.use("/api/reviews", reviewRoutes);
console.log("🔗 Mounted: /api/reviews");

app.use("/api/upload", uploadRoutes);
console.log("🔗 Mounted: /api/upload");

app.use("/api/chat", chatRoutes);
console.log("🔗 Mounted: /api/chat");

app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`📦 User joined room: ${roomId}`);
  });

  socket.on("sendMessage", (message) => {
    const roomId = message.room; 
    io.to(roomId).emit("receiveMessage", message);
    console.log(`✉️ Message sent to room ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// MongoDB Connect + Server Start
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    console.log("✅ MongoDB connected:");
    console.log(`   ➤ Host: ${conn.connection.host}`);
    console.log(`   ➤ DB: ${conn.connection.name}`);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });