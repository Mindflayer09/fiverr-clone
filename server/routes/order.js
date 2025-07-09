import express from "express";
import Order from "../models/Order.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ✅ Place new order
router.post("/", verifyToken, async (req, res) => {
  try {
    const newOrder = new Order({
      ...req.body,  // expects buyerId, sellerId, gigId
    });
    const saved = await newOrder.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ✅ Get orders for a specific user (buyer or seller)
router.get("/user/:id", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ buyerId: req.params.id }, { sellerId: req.params.id }]
    }).populate("gigId").sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ✅ Update order status (freelancer updates)
router.put("/:orderId", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    order.status = req.body.status;
    await order.save();
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
