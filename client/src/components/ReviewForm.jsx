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
      await axios.post(
        "/api/reviews",
        { ...data, gigId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Review submitted!");
      reset();
      setRating(0); // Reset star UI too
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting review");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 rounded-xl shadow-md space-y-5 max-w-md mx-auto"
    >
      <h2 className="text-xl font-semibold text-gray-800">Leave a Review</h2>

      {/* ⭐ Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <div className="flex gap-1">
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
        <textarea
          {...register("comment")}
          rows="4"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {errors.comment && (
          <p className="text-sm text-red-500 mt-1">{errors.comment.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Submit Review
      </button>
    </form>
  );
};

export default ReviewForm;
