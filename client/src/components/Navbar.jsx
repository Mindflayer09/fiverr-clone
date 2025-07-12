import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const handleStorage = () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <nav className="bg-black shadow-md px-6 py-4 flex flex-wrap justify-between items-center">
      {/* Brand */}
      <div className="text-green-500 font-extrabold text-2xl mb-2 sm:mb-0">
        <Link to="/">Fiverr.</Link>
      </div>

      {/* Nav Links */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white font-medium">
        <Link to="/" className="hover:text-green-400 transition">Home</Link>
        <Link to="/gigs" className="hover:text-green-400 transition">GIGs</Link>

        {user?.role === "freelancer" && (
          <>
            <Link to="/my-gigs" className="hover:text-green-400 transition">MY GIGs</Link>
            <Link to="/add-gig" className="hover:text-green-400 transition">ADD GIG</Link>
          </>
        )}
        {user?.role === "client" && (
          <Link to="/orders" className="hover:text-green-400 transition">ORDERS</Link>
        )}

        {!user ? (
          <>
            <Link
              to="/login"
              className="bg-green-600 px-4 py-2 rounded-md text-white hover:bg-green-700 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="border border-green-500 text-green-500 px-4 py-2 rounded-md hover:bg-green-600 hover:text-white transition"
            >
              Register
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-300 text-sm">
              👋 Hi, <span className="font-semibold">{user.username}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-600 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
