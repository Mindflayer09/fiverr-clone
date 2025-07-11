// server/utils/supabase.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const deleteImageFromSupabase = async (imageUrl) => {
  try {
    const path = imageUrl.split("/storage/v1/object/public/")[1]; // extract path
    const { error } = await supabase.storage.from("gigs").remove([path]);

    if (error) {
      console.error("Failed to delete image from Supabase:", error.message);
    } else {
      console.log("Image deleted successfully from Supabase.");
    }
  } catch (err) {
    console.error("Error during Supabase deletion:", err.message);
  }
};
