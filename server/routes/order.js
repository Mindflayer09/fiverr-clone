import express from "express";
import Order from "../models/Order.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * Place a New Order
 * POST /api/orders
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { sellerId, gigId } = req.body;

    if (!sellerId || !gigId) {
      return res.status(400).json({ message: "Missing sellerId or gigId" });
    }

    const newOrder = new Order({ buyerId, sellerId, gigId });
    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("❌ Order creation failed:", err);
    res.status(500).json({
      message: "Server error while placing order",
      error: err.message,
    });
  }
});

/**
 * Get Orders for Logged-in User (Client or Freelancer)
 * GET /api/orders/user/:id
 */
router.get("/user/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    const query =
      req.user.role === "freelancer"
        ? { sellerId: userId }
        : { buyerId: userId };

    const orders = await Order.find(query)
      .populate("gigId", "title images")
      .populate("buyerId", "username")
      .populate("sellerId", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching user orders:", err);
    res.status(500).json({ message: "Server error fetching orders" });
  }
});

/**
 * Get Orders Received by Freelancer
 * GET /api/orders/received/:freelancerId
 */
router.get("/received/:freelancerId", verifyToken, async (req, res) => {
  try {
    const freelancerId = req.params.freelancerId;

    if (req.user.id !== freelancerId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    const receivedOrders = await Order.find({ sellerId: freelancerId })
      .populate("gigId", "title images")
      .populate("buyerId", "username profilePic") 
      .sort({ createdAt: -1 });

    // Transform the response to match frontend expectations
    const formattedOrders = receivedOrders.map((order) => ({
      ...order._doc,
      gig: order.gigId,
      buyer: order.buyerId,
    }));

    res.status(200).json(formattedOrders);
  } catch (err) {
    console.error("❌ Failed to fetch received orders:", err);
    res.status(500).json({ error: "Server error fetching received orders" });
  }
});

/**
 * Update Order Status (Only Freelancer Can Mark as Completed)
 * PUT /api/orders/:id/status
 */
router.put("/:id/status", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "completed"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    //  Only the freelancer can update order status
    if (order.sellerId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the seller can update this order." });
    }

    if (order.status === status) {
      return res
        .status(200)
        .json({ message: `Order is already '${status}'.` });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({
      message: `Order status updated to '${status}'.`,
      order: updatedOrder,
    });
  } catch (err) {
    console.error("❌ Failed to update order status:", err);
    res.status(500).json({ error: "Server error updating order status" });
  }
});

router.get("/all-users-involved/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const orders = await Order.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    });

    const users = new Set();
    orders.forEach((o) => {
      if (o.buyerId.toString() !== userId) users.add(o.buyerId.toString());
      if (o.sellerId.toString() !== userId) users.add(o.sellerId.toString());
    });

    const result = await User.find({ _id: { $in: Array.from(users) } }).select("username _id");
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users involved in orders" });
  }
});

export default router;
