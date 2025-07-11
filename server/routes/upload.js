// server/routes/upload.js
import express from "express";
import multer from "multer";
import { supabase } from "../utils/supabase.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/gig-image", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    const fileName = `gig-${Date.now()}-${file.originalname}`;

    const { data, error } = await supabase.storage
      .from("gigs")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) return res.status(500).json({ error });

    const { data: publicUrlData } = supabase.storage
      .from("gigs")
      .getPublicUrl(data.path);

    res.status(200).json({ url: publicUrlData?.publicUrl });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload error" });
  }
});

export default router;
