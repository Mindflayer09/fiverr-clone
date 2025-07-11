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
        // Fetch Gig
        const gigRes = await axios.get(`http://localhost:5000/api/gigs/${id}`);
        setGig(gigRes.data);

        // Get user from localStorage
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        setUser(loggedInUser);

        // If user is client, fetch orders to check if completed
        if (loggedInUser?.role === "client") {
          const orderRes = await axios.get(
            `http://localhost:5000/api/orders/user/${loggedInUser._id}`
          );

          const completed = orderRes.data.some(
            (order) => order.gigId === id && order.status === "completed"
          );

          setOrderCompleted(completed);
        }
      } catch (err) {
        console.error("Error loading gig or orders", err);
        alert("Error loading gig.");
      }
    };

    fetchGigAndOrders();
  }, [id]);

  const handleOrder = async () => {
    if (!user) {
      alert("Please login to place an order");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/orders",
        {
          buyerId: user._id,
          sellerId: gig.userId,
          gigId: gig._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Order placed successfully!");
    } catch (err) {
      console.error(err);
      alert("Error placing order.");
    }
  };

  if (!gig) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Gig Image */}
      <img
        src={gig.images[0]}
        alt={gig.title}
        className="w-full h-64 object-cover rounded-xl shadow mb-6"
      />

      {/* Title, Description, Price */}
      <h1 className="text-3xl font-bold mb-3 text-gray-900">{gig.title}</h1>
      <p className="text-gray-700 mb-4 leading-relaxed">{gig.description}</p>
      <p className="text-green-700 font-semibold text-2xl mb-6">₹{gig.price}</p>

      {/* Order Button */}
      {user?.role === "client" && (
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
