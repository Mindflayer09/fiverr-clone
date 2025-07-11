import { useEffect, useState } from "react";
import axios from "axios";
import GigCard from "../components/GigCard";

export default function Gigs() {
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredGigs, setFilteredGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/gigs");
        setGigs(res.data);
        setFilteredGigs(res.data);
      } catch (err) {
        alert("Error loading gigs");
      } finally {
        setLoading(false);
      }
    };
    fetchGigs();
  }, []);

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearch(keyword);

    const filtered = gigs.filter(
      (gig) =>
        gig.title.toLowerCase().includes(keyword) ||
        gig.description.toLowerCase().includes(keyword)
    );
    setFilteredGigs(filtered);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800">
        Explore Freelance Gigs
      </h1>

      <input
        type="text"
        placeholder="Search by title or description..."
        value={search}
        onChange={handleSearch}
        className="w-full mb-8 p-4 border border-green-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
      />

      {loading ? (
        <div className="text-center text-gray-500 mt-20 animate-pulse">
          Loading gigs...
        </div>
      ) : filteredGigs.length === 0 ? (
        <div className="text-center text-red-500 mt-10 text-lg">
          No gigs found. Try a different search term.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredGigs.map((gig) => (
            <GigCard key={gig._id} gig={gig} />
          ))}
        </div>
      )}
    </div>
  );
}
