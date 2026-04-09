import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import { verifyToken } from "../middleware/verifyToken.js";

// ✅ Load environment variables
dotenv.config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "skillbridge_gigs", 
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });
router.post("/gig-image", verifyToken, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    return res.status(200).json({ 
      url: req.file.path,
      message: "Successfully uploaded to Cloudinary!"
    });

  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);
    return res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;