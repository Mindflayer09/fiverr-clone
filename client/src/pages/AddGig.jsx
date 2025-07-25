import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSpinner, FaPlus, FaTag, FaDollarSign, FaFileImage, FaPen } from "react-icons/fa";
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
  const [fileName, setFileName] = useState("No file chosen");

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
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
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
    
    console.log("Returned image URL from upload API:", imageUrl); 

    if (!imageUrl) {
      throw new Error("Image upload failed (no URL returned).");
    }

    const gigPayload = {
      title: data.title,
      description: data.description,
      price: data.price,
      images: [imageUrl],
    };
    console.log("DEBUG: Gig Payload BEFORE sending to backend:", gigPayload);

    await axios.post(
      "http://localhost:5000/api/gigs",
      gigPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("🎉 Gig created successfully!");
    reset();
    setFileName("No file chosen");
    navigate("/my-gigs");
  } catch (err) {
    console.error("❌ Gig creation failed:", err.response?.data || err.message);
    alert("❌ Failed to create gig. Please try again.");
  } finally {
    setLoading(false);
  }
};
  
  // Handle file name change for the custom file input
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("No file chosen");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-4xl p-10 space-y-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-4xl font-bold text-center text-gray-800 dark:text-white flex items-center justify-center gap-3">
          <FaPlus className="text-blue-500" />
          Add a New Gig
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400">
          Fill in the details below to create a new gig for your services.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Title */}
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Gig Title</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <FaTag />
              </span>
              <input
                {...register("title")}
                type="text"
                placeholder="e.g., I will design a professional logo for your brand"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            {errors.title && (
              <p className="text-red-500 text-sm mt-2">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Description</label>
            <div className="relative">
              <span className="absolute top-4 left-4 text-gray-400">
                <FaPen />
              </span>
              <textarea
                {...register("description")}
                rows={5}
                placeholder="Provide a detailed description of your gig and what you offer..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            {errors.description && (
              <p className="text-red-500 text-sm mt-2">{errors.description.message}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Price</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <FaDollarSign />
              </span>
              <input
                {...register("price")}
                type="number"
                step="0.01"
                placeholder="e.g., 50.00"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-sm mt-2">{errors.price.message}</p>
            )}
          </div>

          {/* Upload Image - Custom Input */}
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Gig Image</label>
            <div className="relative flex items-center justify-between p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 transition-colors">
              <div className="flex items-center space-x-3">
                <FaFileImage className="text-gray-400 text-xl" />
                <span className="text-gray-600 dark:text-gray-300 truncate">
                  {fileName}
                </span>
              </div>
              <label
                htmlFor="image-upload"
                className="cursor-pointer bg-blue-500 text-white text-sm font-semibold py-2 px-4 rounded-full hover:bg-blue-600 transition-colors"
              >
                Choose File
                <input
                  id="image-upload"
                  type="file"
                  {...register("image", { onChange: handleFileChange })}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>
            {errors.image && (
              <p className="text-red-500 text-sm mt-2">{errors.image.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isValid}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
              loading || !isValid
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              "Create Gig"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}