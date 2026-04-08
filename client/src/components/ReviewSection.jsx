import { useEffect, useState } from "react";
import axios from "axios";

const ReviewSection = ({ gigId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    axios
      .get(`/api/reviews/${gigId}`)
      .then((res) => setReviews(res.data))
      .catch((err) => console.error(err));
  }, [gigId]);

  const averageRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  return (
    <div className="mt-8 bg-gray-50 p-6 rounded-xl shadow-inner">
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        Reviews <span className="text-sm font-normal text-gray-500">({reviews.length})</span>
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        Average Rating: <span className="font-semibold">{averageRating} ★</span>
      </p>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-500 italic">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex items-start gap-4 mb-2">
                {/* 👤 User Avatar */}
                <img
                  src={review.userId?.avatar || "/default-avatar.png"}
                  alt={review.userId?.username}
                  className="w-10 h-10 rounded-full object-cover border"
                />

                <div className="flex-1">
                  {/* 🧑 Username + Date */}
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800">
                      {review.userId?.username || "Anonymous"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* ⭐ Rating */}
                  <div className="text-yellow-500 text-sm mb-1">⭐ {review.rating}</div>

                  {/* 💬 Comment */}
                  <p className="text-gray-700 text-sm">{review.comment}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
