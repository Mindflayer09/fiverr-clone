import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

export default function GigCard({ gig }) {
  const {
    _id: gigId,
    title,
    description,
    price,
    images,
    userId: sellerId,
  } = gig;

  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const imageUrl = images?.[0]
    ? images[0]
    : "/default.png";
  console.log("Image URL:", imageUrl); 

  const handleOrder = async () => {
    if (!user || user.role !== "client") {
      alert("⚠️ You must be logged in as a client to place an order.");
      navigate("/login");
      return;
    }

    try {
       await axios.post(
        `${BASE_URL}/api/orders`,
        {
          sellerId,
          gigId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("✅ Order placed successfully!");
    } catch (err) {
      console.error("❌ Order error:", err?.response?.data || err.message);
      alert(`❌ Failed to place order: ${err?.response?.data?.message || "Server error"}`);
    }
  };

  return (
    <div className="border rounded-lg shadow hover:shadow-lg transition p-4 bg-white flex flex-col justify-between">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      <p className="text-green-700 font-bold mt-4">${price}</p>
      <button
        onClick={handleOrder}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
      >
        🛒 Order Now
      </button>
    </div>
  );
}
