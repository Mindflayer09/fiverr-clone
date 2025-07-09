// client/src/components/GigCard.jsx
import { useNavigate } from "react-router-dom";

export default function GigCard({ gig }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/gig/${gig._id}`)}
      className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden border border-gray-100"
    >
      <img
        src={gig.images[0]}
        alt={gig.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{gig.title}</h2>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {gig.description}
        </p>
        <p className="text-green-600 font-bold text-right">₹{gig.price}</p>
      </div>
    </div>
  );
}
