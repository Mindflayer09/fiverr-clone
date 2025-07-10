import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import crypto from "crypto";

const router = express.Router();

router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("username email");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "User not found" });
  }
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password , role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashed, role });
    await newUser.save();
    res.status(201).json({ msg: "User registered" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Attempting login for:", email);
    const user = await User.findOne({ email });

    if (!user) {
    console.log("❌ User not found for email:", email);
    return res.status(400).json({ msg: "Invalid credentials" });
  }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
     console.log("❌ Password does not match for:", email);
     return res.status(400).json({ msg: "Invalid credentials" });
  }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 15; // valid for 15 mins
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    // In real app, send via nodemailer. For now just return it:
    res.json({ msg: "Password reset link sent", resetLink });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // token not expired
    });

    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
