import { useEffect, useState } from "react";
import axios from "axios";
import GigCard from "../components/GigCard";

const BASE_URL = "http://localhost:5000"; // adjust if deployed

export default function Gigs() {
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/gigs`);
        setGigs(res.data);
      } catch (err) {
        console.error("Failed to fetch gigs:", err);
        setError("Failed to load gigs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  const filteredGigs = gigs.filter((gig) => {
    const searchTerm = search.toLowerCase();
    return (
      gig.title.toLowerCase().includes(searchTerm) ||
      gig.description.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-green-700">
        Explore Freelance Gigs
      </h1>

      <input
        type="text"
        placeholder="Search gigs by title or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-xl mx-auto block mb-10 p-4 border border-green-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
      />

      {loading ? (
        <div className="text-center text-gray-500 mt-20 animate-pulse">
          Loading gigs...
        </div>
      ) : error ? (
        <div className="text-center text-red-500 mt-10">{error}</div>
      ) : filteredGigs.length === 0 ? (
        <div className="text-center text-red-500 mt-10 text-lg">
          No gigs found. Try a different search term.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredGigs.map((gig) => (
            <GigCard key={gig._id} gig={{ ...gig, BASE_URL }} />
          ))}
        </div>
      )}
    </div>
  );
}
