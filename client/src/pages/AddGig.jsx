import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../utils/supabase";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Zod validation schema
const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
});

export default function AddGig() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // ✅ Role protection: freelancers only
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "freelancer") {
      alert("Access denied: freelancers only");
      navigate("/");
    }
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const imageFile = data.image[0];

      // ✅ Upload to Supabase
      const { data: uploadData, error } = await supabase.storage
        .from("gigs")
        .upload(`gig-${Date.now()}`, imageFile);

      if (error) {
        console.error("Upload error:", error);
        alert("Image upload failed. Try again.");
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("gigs")
        .getPublicUrl(uploadData.path);

      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/gigs",
        { ...data, images: [publicUrl.publicUrl] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Gig added successfully!");

      // ✅ Reset form and redirect
      reset();
      navigate("/my-gigs");
    } catch (err) {
      console.error("Gig submission failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl mx-auto bg-white p-8 shadow-xl rounded-xl mt-10 space-y-6"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800">Add New Gig</h2>

      <input
        {...register("title")}
        placeholder="Title"
        className="w-full border p-3 rounded-md"
      />
      {errors.title && <p className="text-red-500">{errors.title.message}</p>}

      <textarea
        {...register("description")}
        placeholder="Description"
        className="w-full border p-3 rounded-md"
      />
      {errors.description && (
        <p className="text-red-500">{errors.description.message}</p>
      )}

      <input
        type="number"
        {...register("price")}
        placeholder="Price"
        className="w-full border p-3 rounded-md"
      />
      {errors.price && <p className="text-red-500">{errors.price.message}</p>}

      <input
        type="file"
        {...register("image")}
        className="w-full border p-3 rounded-md"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Gig"}
      </button>
    </form>
  );
}
