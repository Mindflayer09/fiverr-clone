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

export default router;
