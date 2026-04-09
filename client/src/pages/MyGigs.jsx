import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import { getLoggedInUser } from "../utils/getLoggedInUser";

const MyGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGigs = async () => {
      const user = getLoggedInUser();
      console.log("👤 Logged in user:", user);

      if (!user || (!user._id && !user.id)) {
        setError("⚠️ You must be logged in to view your gigs.");
        setLoading(false);
        return;
      }

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        setError("❌ Authentication token missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const userId = user._id || user.id;
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/gigs/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!Array.isArray(response.data)) {
          throw new Error("Unexpected response from server.");
        }

        setGigs(response.data);
      } catch (err) {
        console.error("❌ Error fetching gigs:", err);
        setError(
          err.response?.data?.msg ||
            err.response?.data?.message ||
            "Failed to fetch gigs."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <span className="ml-4 text-lg font-medium">Loading your gigs...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-10 text-center text-gray-800">
          📦 My Gigs
        </h2>

        {error ? (
          <p className="text-center text-red-600 text-lg font-semibold">{error}</p>
        ) : gigs.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            You haven’t created any gigs yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gigs.map((gig) => (
              <div
                key={gig._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
              <img 
  src={
    gig.images?.[0]?.startsWith("http") 
      ? gig.images[0] // If it's a Cloudinary link, use it directly!
      : `${process.env.REACT_APP_BACKEND_URL}/${gig.images?.[0]?.replace(/^\//, "")}` // Fallback for old local images
  } 
  alt={gig.title} 
/>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {gig.title}
                </h3>
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {gig.description}
                </p>
                <p className="text-blue-600 font-bold text-lg">${gig.price}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGigs;
