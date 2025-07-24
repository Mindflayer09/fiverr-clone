import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/verifyToken.js";
import mongoose from "mongoose";

const router = express.Router();

// Place a New Order
router.post("/", verifyToken, async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { sellerId, gigId } = req.body;

    if (!sellerId || !gigId) {
      return res.status(400).json({ message: "Missing sellerId or gigId" });
    }

    const newOrder = new Order({ buyerId, sellerId, gigId });
    const savedOrder = await newOrder.save();
    console.log("✅ New order placed:", savedOrder._id);
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("❌ Order creation failed:", err.message);
    res.status(500).json({ message: "Server error while placing order" });
  }
});

// Get Orders for Logged-in User (Client or Freelancer)
router.get("/user/:id", verifyToken, async (req, res) => {

  const userId = req.params.id;
  console.log("Authenticated User:", req.user);

  if (userId !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized access." });
  }

  try {
    const query = req.user.role === "freelancer"
      ? { sellerId: userId } 
      : { buyerId: userId };

    const orders = await Order.find(query)
      .populate("gigId", "title images")
      .populate("buyerId", "username profilePic")
      .populate("sellerId", "username profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Failed to fetch user orders:", err.message);
    res.status(500).json({ message: "Server error fetching orders" });
  }
});

// Get Orders Received by Freelancer
router.get("/received/:id", verifyToken, async (req, res) => { 
  try {
    const freelancerId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(freelancerId)) {
      return res.status(400).json({ message: "Invalid freelancer ID" });
    }
    const orders = await Order.find({ sellerId: freelancerId })
      .populate("gigId", "title")
      .populate("buyerId", "username");
    console.log(`✅ Fetched orders for freelancer ${freelancerId}:`, orders);
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching received orders:", err);
    res.status(500).json({ message: "Failed to fetch received orders" });
  }
});

// Update Order Status (Only Seller Can Update)
router.put("/:id/status", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["pending", "completed"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id, sellerId: req.user.id },
      { $set: { status: status } },
      { new: true }
    )
    .populate("gigId", "title images")
    .populate("buyerId", "username profilePic")
    .populate("sellerId", "username profilePic");
    
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found or unauthorized." });
    }

    console.log("✅ Order status updated:", updatedOrder._id);
    res.status(200).json({
      message: `Order status updated to '${status}'.`,
      order: updatedOrder,
    });

  } catch (err) {
    console.error("❌ Failed to update order:", err.message);
    res.status(500).json({ message: "Server error updating order" });
  }
});

// Get All Users Involved in Any Orders
router.get("/all-users-involved/:userId", verifyToken, async (req, res) => {
  const userId = req.params.userId;
  if (userId !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized access." });
  }
  try {
    const orders = await Order.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    });
    const userIds = new Set();
    orders.forEach((order) => {
      if (order.buyerId.toString() !== userId) {
        userIds.add(order.buyerId.toString());
      }
      if (order.sellerId.toString() !== userId) {
        userIds.add(order.sellerId.toString());
      }
    });
    const users = await User.find({
      _id: { $in: Array.from(userIds) },
    }).select("_id username profilePic");
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Failed to fetch involved users:", err.message);
    res.status(500).json({ message: "Server error fetching involved users" });
  }
});

export default router;