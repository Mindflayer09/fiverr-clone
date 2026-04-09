import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReviewForm from "../components/ReviewForm";
import ReviewSection from "../components/ReviewSection";

export default function GigDetails() {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [user, setUser] = useState(null);
  const [orderCompleted, setOrderCompleted] = useState(false);

  useEffect(() => {
    const fetchGigAndOrders = async () => {
      try {
        const gigRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/gigs/${id}`);
        setGig(gigRes.data);

        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        setUser(loggedInUser);

        const userId = loggedInUser?.id || loggedInUser?._id;

        if (loggedInUser?.role === "client" && userId) {
          const orderRes = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/orders/user/${userId}`
          );

          const completed = orderRes.data.some(
            (order) => order.gigId === id && order.status === "completed"
          );

          setOrderCompleted(completed);
        }
      } catch (err) {
        console.error("Error loading gig or orders", err);
      }
    };

    fetchGigAndOrders();
  }, [id]);

  const handleOrder = async () => {
    if (!user) {
      alert("Please login to place an order");
      return;
    }

    // ✅ Grab the token and clean it
    let token = localStorage.getItem("token");
    
    // Frontend safety net: stop the request if token is literally missing
    if (!token) {
      alert("Session expired. Please log out and log back in to refresh your token.");
      return;
    }
    
    // Sometimes localStorage saves tokens with extra quotes. This strips them.
    token = token.replace(/^"|"$/g, '');

    // ✅ Use the correct ID format
    const safeBuyerId = user.id || user._id;

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/orders`,
        {
          buyerId: safeBuyerId, // ✅ Use the safe variable here!
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
      // This will show you exactly what the backend is complaining about
      alert(`Error: ${err.response?.data?.message || "Failed to place order."}`);
    }
  };

  if (!gig) return <p className="text-center mt-10">Loading...</p>;

  // ✅ Safe image rendering
  const imageUrl = (gig.images?.[0] && typeof gig.images[0] === 'string')
    ? gig.images[0].startsWith("http")
        ? gig.images[0]
        : `${process.env.REACT_APP_BACKEND_URL}/${gig.images[0].replace(/^\//, "")}`
    : "https://placehold.co/800x400?text=No+Image+Available";

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Gig Image */}
      <img
        src={imageUrl}
        alt={gig.title}
        className="w-full h-64 object-cover rounded-xl shadow mb-6"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://placehold.co/800x400?text=Image+Load+Error";
        }}
      />

      {/* Title, Description, Price */}
      <h1 className="text-3xl font-bold mb-3 text-gray-900">{gig.title}</h1>
      <p className="text-gray-700 mb-4 leading-relaxed">{gig.description}</p>
      <p className="text-green-700 font-semibold text-2xl mb-6">₹{gig.price}</p>

      {/* Order Button */}
      {user?.role?.toLowerCase() === "client" && (
        <button
          onClick={handleOrder}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition mb-10"
        >
          Order Now
        </button>
      )}

      {/* Reviews Section */}
      <div className="mt-10">
        <ReviewSection gigId={gig._id} />
      </div>

      {/* Review Form (Only if client & order completed) */}
      {user?.role === "client" && orderCompleted && (
        <div className="mt-10">
          <ReviewForm gigId={gig._id} token={localStorage.getItem("token")} />
        </div>
      )}
    </div>
  );
}