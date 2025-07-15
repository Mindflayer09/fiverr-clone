import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  price: z.coerce.number().positive("Price must be a positive number"),
  image: z.any().refine((files) => files?.length === 1, {
    message: "One image is required",
  }),
});

export default function AddGig() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "freelancer") {
      alert("Access denied: Only freelancers can create gigs.");
      navigate("/login");
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://localhost:5000/api/upload/gig-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data?.url || res.data?.path;
    } catch (err) {
      console.error("Image upload failed:", err);
      return null;
    }
  };

  const onSubmit = async (data) => {
    if (!token) {
      alert("User authentication failed. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const imageFile = data.image[0];
      const imageUrl = await uploadImage(imageFile);

      await axios.post(
        "http://localhost:5000/api/gigs",
        {
          title: data.title,
          description: data.description,
          price: data.price,
          images: [imageUrl],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("🎉 Gig created successfully!");
      reset();
      navigate("/my-gigs");
    } catch (err) {
      console.error("❌ Gig creation failed:", err.response?.data || err.message);
      alert("❌ Failed to create gig. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-20">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-3xl p-10 space-y-8 bg-white rounded-3xl shadow-xl"
      >
        <h2 className="text-4xl font-bold text-center text-gray-800">
          🎨 Add a New Gig
        </h2>

        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            {...register("title")}
            className="w-full border p-3 rounded-xl"
            placeholder="Enter gig title"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full border p-3 rounded-xl"
            placeholder="Describe your gig"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Price ($)</label>
          <input
            type="number"
            {...register("price")}
            className="w-full border p-3 rounded-xl"
            placeholder="Enter price"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Upload Image</label>
          <input
            type="file"
            {...register("image")}
            accept="image/*"
            className="w-full"
          />
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2 inline" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </form>
    </div>
  );
}
