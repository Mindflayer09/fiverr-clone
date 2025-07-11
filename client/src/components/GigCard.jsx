import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";

export default function GigCard({ gig }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/gig/${gig._id}`)}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-green-500"
    >
      {/* Image */}
      <img
        src={gig.images?.[0] || "/placeholder.jpg"}
        alt={gig.title}
        className="w-full h-48 object-cover transition duration-300 hover:scale-105"
      />

      {/* Content */}
      <div className="p-4 flex flex-col justify-between h-full">
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
          {gig.title}
        </h2>

        {/* Rating */}
        <div className="flex items-center text-yellow-500 text-sm gap-1 mb-2">
          <FaStar className="text-base" />
          <span>{gig.averageRating?.toFixed(1) || "0.0"}</span>
          <span className="text-gray-400 ml-1">(Reviews)</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {gig.description}
        </p>

        {/* Price */}
        <div className="text-right">
          <span className="text-green-600 font-bold text-md">₹{gig.price}</span>
        </div>
      </div>
    </div>
  );
}
