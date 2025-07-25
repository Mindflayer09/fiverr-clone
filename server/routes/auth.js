import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";

const router = express.Router();

// GET user info (public endpoint)
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("username email");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("User fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all users except the current user (for chat contact list)
router.get("/all/:currentUserId", async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.currentUserId } }).select("username profilePicture role");
    res.status(200).json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ msg: "Error fetching users" });
  }
});


// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    console.log("REGISTER ATTEMPT - Request Body:", req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {

      console.log("REGISTER ERROR: Email already registered:", email);
      return res.status(400).json({ msg: "Email already registered" });
    }

    const newUser = new User({ username, email, password, role });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("REGISTER SUCCESS for user:", newUser.username);

    res.status(201).json({
      msg: `Welcome, ${newUser.username}!`,
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Registration error (catch block):", err);
    res.status(500).json({ msg: "Server error during registration" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    console.log("LOGIN ATTEMPT - Request Body:", req.body);

    if (!email || !password || !role) {
      console.log("LOGIN ERROR: Missing email, password, or role in request.");
      return res.status(400).json({ msg: "Email, password, and role are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("LOGIN ERROR: User not found for email:", email);
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("LOGIN ERROR: Password mismatch for user:", email);
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    if (user.role !== role) {
      console.log(`LOGIN ERROR: Role mismatch for user ${email}. Expected ${role}, but found ${user.role} in DB.`);
      return res.status(400).json({ msg: "Invalid role selected for this account." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ADDED LOGGING: Indicate successful login
    console.log("LOGIN SUCCESS for user:", user.username);

    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("Login error (catch block):", err);
    res.status(500).json({ msg: "Server error during login" });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 15;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    res.json({ msg: "Reset link generated", resetLink });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ msg: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;