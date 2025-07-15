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
  const [alreadyOrdered, setAlreadyOrdered] = useState(false);

  useEffect(() => {
    const fetchGigAndOrders = async () => {
      try {
        // Fetch gig
        const gigRes = await axios.get(`http://localhost:5000/api/gigs/${id}`);
        setGig(gigRes.data);

        // Get logged-in user
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        setUser(loggedInUser);

        if (loggedInUser?.role === "client") {
          const orderRes = await axios.get(
            `http://localhost:5000/api/orders/user/${loggedInUser._id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          const ordersForThisGig = orderRes.data.filter(
            (order) => order.gigId?._id === id
          );

          if (ordersForThisGig.length > 0) {
            setAlreadyOrdered(true);
            const completed = ordersForThisGig.some(
              (order) => order.status === "completed"
            );
            setOrderCompleted(completed);
          }
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
      alert("✅ Order placed successfully!");
      setAlreadyOrdered(true);
    } catch (err) {
      console.error("❌ Error placing order", err);
      alert("Error placing order.");
    }
  };

  if (!gig) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Gig Image */}
      <img
        src={gig.images?.[0]}
        alt={gig.title}
        className="w-full h-64 object-cover rounded-xl shadow mb-6"
      />

      {/* Title, Description, Price */}
      <h1 className="text-3xl font-bold mb-3 text-gray-900">{gig.title}</h1>
      <p className="text-gray-700 mb-4 leading-relaxed">{gig.description}</p>
      <p className="text-green-700 font-semibold text-2xl mb-6">₹{gig.price}</p>

      {/* Order Button / Already Ordered Badge */}
      {user?.role === "client" && (
        alreadyOrdered ? (
          <div className="inline-flex items-center space-x-2 mb-8">
            <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
              ✅ Already Ordered
            </span>
          </div>
        ) : (
          <button
            onClick={handleOrder}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-shadow shadow hover:shadow-lg mb-8"
          >
            🚀 Order Now
          </button>
        )
      )}

      {/* Reviews */}
      <div className="mt-10">
        <ReviewSection gigId={gig._id} />
      </div>

      {/* Review Form - Only if completed */}
      {user?.role === "client" && orderCompleted && (
        <div className="mt-10">
          <ReviewForm gigId={gig._id} token={localStorage.getItem("token")} />
        </div>
      )}
    </div>
  );
}
