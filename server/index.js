import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import { v2 as cloudinary } from 'cloudinary';

// Route imports
import authRoutes from "./routes/auth.js";
import gigRoutes from "./routes/gigs.js";
import orderRoutes from "./routes/order.js";
import reviewRoutes from "./routes/reviews.js";
import uploadRoutes from "./routes/upload.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
}); 

const app = express();
const server = http.createServer(app);

const REQUIRED_ENV_VARS = [
  "MONGO_URI", 
  "JWT_SECRET", 
  "PORT", 
  "CLOUDINARY_CLOUD_NAME", 
  "CLOUDINARY_API_KEY", 
  "CLOUDINARY_API_SECRET",
  "CLIENT_URL"
];

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
];

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

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
    origin: allowedOrigins,
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