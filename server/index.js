import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";

//  Load environment variables
dotenv.config();

const REQUIRED_ENV_VARS = ["MONGO_URI", "JWT_SECRET", "PORT"];
for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = express();

//  Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

//  Routes
import authRoutes from "./routes/Auth.js";
import gigRoutes from "./routes/Gigs.js";
import orderRoutes from "./routes/order.js";
import messageRoutes from "./routes/messages.js";
import reviewRoutes from "./routes/reviews.js";
import uploadRoutes from "./routes/upload.js";

app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);

//  Root route
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

//  Create server and socket
const server = http.createServer(app);
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
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("sendMessage", (msg) => {
    const receiverSocket = onlineUsers.get(msg.receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", msg);
    }
  });

  socket.on("typing", ({ receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("typing", { from: socket.id });
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    console.log("❌ Socket disconnected:", socket.id);
  });
});

//  Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    console.log("✅ MongoDB connected:");
    console.log(`   ➤ Host: ${conn.connection.host}`);
    console.log(`   ➤ Database: ${conn.connection.name}`);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
