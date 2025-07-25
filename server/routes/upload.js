import express from "express";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { verifyToken } from "../middleware/verifyToken.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const router = express.Router();
const storage = multer.memoryStorage(); 

const upload = multer({ storage: storage });

router.post("/gig-image", verifyToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        folder: "gig_images",
        resource_type: "auto",
      }
    );

    const imageUrl = result.secure_url;
    
    console.log("✅ Image uploaded to Cloudinary:", imageUrl);
    return res.status(200).json({ url: imageUrl }); 
  } catch (error) {
    console.error("❌ Image upload to Cloudinary failed:", error);
    return res.status(500).json({ error: "Failed to upload image to Cloudinary." });
  }
});

export default router;