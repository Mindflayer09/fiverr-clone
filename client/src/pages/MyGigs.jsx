import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MyGigs() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  // Load user and token, redirect if not freelancer
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("token");

    if (!storedUser || storedUser.role !== "freelancer") {
      alert("Access denied: freelancers only");
      navigate("/");
      return;
    }

    setUser(storedUser);
    setToken(storedToken);
  }, [navigate]);

  // Fetch user's gigs
  useEffect(() => {
    if (!user || !token) return;

    const fetchGigs = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/gigs/user/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGigs(res.data);
      } catch (err) {
        console.error("Failed to fetch gigs:", err);
        alert("Could not load your gigs.");
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, [user, token]);

  // Delete gig
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this gig?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/gigs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGigs(gigs.filter((gig) => gig._id !== id));
      alert("Gig deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete gig");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">My Gigs</h1>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : gigs.length === 0 ? (
        <p className="text-center text-gray-500">You haven't posted any gigs yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <div
              key={gig._id}
              className="border rounded-xl shadow p-4 bg-white flex flex-col justify-between"
            >
              <img
                src={gig.images?.[0] || "/fallback.jpg"}
                alt={gig.title}
                className="rounded-md w-full h-40 object-cover mb-4"
              />
              <h2 className="text-xl font-semibold">{gig.title}</h2>
              <p className="text-green-600 font-bold">₹{gig.price}</p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleDelete(gig._id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => navigate(`/edit-gig/${gig._id}`)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
