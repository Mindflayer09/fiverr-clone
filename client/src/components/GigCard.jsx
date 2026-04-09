import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Your backend URL

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
  ? `${process.env.REACT_APP_BACKEND_URL}/${images[0].replace(/^\//, "")}` 
  : "/default.jpg";
  
 const handleOrder = async () => {
    // ✅ 1. Look in sessionStorage instead of localStorage!
    const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
    
    if (!loggedInUser) {
      alert("Please login to place an order");
      return;
    }

    // 2. Safely get the ID
    const safeBuyerId = loggedInUser.id || loggedInUser._id;

    // ✅ 3. Grab the token from sessionStorage!
    let token = sessionStorage.getItem("token");
    
    if (!token) {
      alert("Session expired. Please log out and log back in to refresh your token.");
      return;
    }
    
    // Strip any accidental quotes
    token = token.replace(/^"|"$/g, '');

    try {
      // 4. The perfectly formatted Axios request
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/orders`, 
        {
          buyerId: safeBuyerId,
          sellerId: gig.userId,
          gigId: gig._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      alert("🎉 Order placed successfully!");
      
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.response?.data?.message || "Failed to place order."}`);
    }
  };

  return (
    <div className="border rounded-lg shadow hover:shadow-lg transition p-4 bg-white flex flex-col justify-between">
      <img 
  src={
    gig.images?.[0]?.startsWith("http") 
      ? gig.images[0] // If it's a Cloudinary link, use it directly!
      : `${process.env.REACT_APP_BACKEND_URL}/${gig.images?.[0]?.replace(/^\//, "")}` // Fallback for old local images
  } 
  alt={gig.title} 
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
