import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Directory where images will be saved
const gigUploadPath = path.join("uploads", "gigs");

// Ensure directory exists
fs.mkdirSync(gigUploadPath, { recursive: true });

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, gigUploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedFilename = file.originalname.replace(/\s+/g, "_");
    cb(null, `gig-${uniqueSuffix}-${sanitizedFilename}`);
  },
});

const upload = multer({ storage });

// POST /api/upload/gig-image
router.post("/gig-image", verifyToken, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = `/uploads/gigs/${req.file.filename}`;
    return res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error("Image upload error:", error);
    return res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;
