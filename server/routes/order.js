import express from "express";
import Order from "../models/Order.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// ✅ Place new order
router.post("/", verifyToken, async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { sellerId, gigId } = req.body;

    if (!sellerId || !gigId) {
      return res.status(400).json({ message: "Missing sellerId or gigId" });
    }

    const newOrder = new Order({
      buyerId,
      sellerId,
      gigId,
    });

    const saved = await newOrder.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({
      message: "Server error placing order",
      error: err.message,
    });
  }
});

// ✅ Fetch user orders
router.get("/user/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    const query = req.user.role === "freelancer"
      ? { sellerId: userId }
      : { buyerId: userId };

    const orders = await Order.find(query)
      .populate("gigId", "title") // show gig title only
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching user orders:", err);
    res.status(500).json({ message: "Server error fetching orders" });
  }
});

// ✅ NEW: Update order status (This fixes the 404!)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    // Find the order and update its status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } // This tells MongoDB to return the updated document, not the old one
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error("❌ Error updating order status:", err);
    res.status(500).json({ message: "Server error updating order status" });
  }
});

export default router;