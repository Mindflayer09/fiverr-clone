import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

// Zod validation schema
const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  image: z.any(),
});

export default function AddGig() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Redirect non-freelancers
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

  // Upload image to backend
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const token = localStorage.getItem("token");

    const res = await axios.post("http://localhost:5000/api/upload/gig-image", formData, {
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

      await axios.post("http://localhost:5000/api/gigs", gigData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("🎉 Gig added successfully!");
      reset();
      navigate("/my-gigs");
    } catch (err) {
      console.error("Gig submission failed:", err);
      alert("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 px-4 py-20">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-3xl p-10 space-y-8 rounded-3xl shadow-xl border border-gray-200 bg-white/90 backdrop-blur-md bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/dot-grid.png')] bg-repeat animate-fade-in"
      >
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-6 tracking-tight">
          🎨 ADD A NEW GIG
        </h2>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-1">Title</label>
          <input
            id="title"
            {...register("title")}
            placeholder="e.g., I will build your React website"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            {...register("description")}
            rows={5}
            placeholder="Explain what services you will offer..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-lg font-medium text-gray-700 mb-1">Price ($)</label>
          <input
            id="price"
            type="number"
            {...register("price")}
            placeholder="e.g., 75"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="image" className="block text-lg font-medium text-gray-700 mb-1">Upload Image</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            {...register("image")}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-gray-50"
          />
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all duration-300 disabled:opacity-50"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> Submitting...
            </>
          ) : (
            "SUBMIT"
          )}
        </button>
      </form>
    </div>
  );
}
