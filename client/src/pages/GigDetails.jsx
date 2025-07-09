import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function GigDetails() {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/gigs/${id}`);
        setGig(res.data);
      } catch (err) {
        alert("Gig not found");
      }
    };

    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    setUser(loggedInUser);

    fetchGig();
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
      <img
        src={gig.images[0]}
        alt={gig.title}
        className="w-full h-64 object-cover rounded-md mb-6"
      />
      <h1 className="text-3xl font-bold mb-4">{gig.title}</h1>
      <p className="text-gray-700 mb-4">{gig.description}</p>
      <p className="text-green-700 font-bold text-xl mb-6">₹{gig.price}</p>

      {user?.role === "client" && (
        <button
          onClick={handleOrder}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
        >
          Order Now
        </button>
      )}
    </div>
  );
}
