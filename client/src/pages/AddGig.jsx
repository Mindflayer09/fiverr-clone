import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

//  Zod validation schema
const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  image: z.any(),
});

export default function AddGig() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  //  Role protection: freelancers only
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "freelancer") {
      alert("Access denied: freelancers only");
      navigate("/");
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  //  Upload to backend → Supabase
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const token = localStorage.getItem("token");

    const res = await axios.post("/api/upload/gig-image", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data?.url;
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      const imageFile = data.image[0];
      const imageUrl = await uploadImage(imageFile);

      if (!imageUrl) {
        alert("Image upload failed");
        return;
      }

      const gigData = {
        title: data.title,
        description: data.description,
        price: data.price,
        images: [imageUrl],
        userId: user._id,
      };

      await axios.post("/api/gigs", gigData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Gig added successfully!");
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
      className="max-w-2xl mx-auto bg-white p-10 shadow-2xl rounded-2xl mt-16 space-y-6 border border-gray-100"
    >
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">🎨 Add New Gig</h2>

      {/* Title */}
      <div>
        <label className="block mb-2 font-medium text-gray-700">Title</label>
        <input
          {...register("title")}
          placeholder="e.g., I will design your portfolio website"
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block mb-2 font-medium text-gray-700">Description</label>
        <textarea
          {...register("description")}
          placeholder="Explain your service in detail..."
          rows={5}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      {/* Price */}
      <div>
        <label className="block mb-2 font-medium text-gray-700">Price ($)</label>
        <input
          type="number"
          {...register("price")}
          placeholder="e.g., 50"
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
      </div>

      {/* Image Upload */}
      <div>
        <label className="block mb-2 font-medium text-gray-700">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          {...register("image")}
          className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50"
        />
        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-60"
      >
        {loading ? "Submitting..." : "➕ Submit Gig"}
      </button>
    </form>
  );
}
