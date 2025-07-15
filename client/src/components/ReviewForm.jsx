import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { FaStar } from "react-icons/fa";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters."),
});

const ReviewForm = ({ gigId, token }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await axios.post(
        "/api/reviews",
        { ...data, gigId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("✅ Review submitted!");
      reset();
      setRating(0);
    } catch (err) {
      alert(err.response?.data?.message || "❌ Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 max-w-lg mx-auto mt-10"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">⭐ Leave a Review</h2>

      {/* ⭐ Star Rating */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`cursor-pointer text-2xl transition-colors ${
                (hover || rating) >= star ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => {
                setRating(star);
                setValue("rating", star);
              }}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </div>
        {errors.rating && (
          <p className="text-sm text-red-500 mt-1">{errors.rating.message}</p>
        )}
      </div>

      {/* 📝 Comment Field */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Comment
        </label>
        <textarea
          {...register("comment")}
          rows="4"
          placeholder="Write your experience..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 resize-none transition"
        />
        {errors.comment && (
          <p className="text-sm text-red-500 mt-1">{errors.comment.message}</p>
        )}
      </div>

      {/* ✅ Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className={`w-full py-2 rounded-lg text-white font-medium transition ${
          submitting
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

export default ReviewForm;
