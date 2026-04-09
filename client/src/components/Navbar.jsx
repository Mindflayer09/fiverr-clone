import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  // ✅ SAFE ROUTING: Convert to lowercase to prevent "Freelancer" vs "freelancer" bugs
  const safeRole = user?.role?.toLowerCase() || "";
  const dashboardRoute = "/dashboard";

  return (
    <nav className="bg-black text-white px-6 py-4 shadow-md flex justify-between items-center flex-wrap relative z-10">
      <Link to="/" className="text-2xl font-bold text-green-500">
        Skill Bridge.
      </Link>

      <div className="flex flex-wrap gap-4 items-center text-sm sm:text-base">
        <Link to="/" className="hover:text-green-400 transition">Home</Link>
        <Link to="/gigs" className="hover:text-green-400 transition">Explore Gigs</Link>

        {!user ? (
          <>
            <Link to="/login" className="bg-green-600 px-4 py-2 rounded-md hover:bg-green-700 transition">Login</Link>
            <Link to="/register" className="border border-green-500 text-green-500 px-4 py-2 rounded-md hover:bg-green-600 hover:text-white transition">Register</Link>
          </>
        ) : (
          <div className="flex items-center gap-4 ml-2">
            {/* The Unified Dashboard Button */}
            <Link 
              to={dashboardRoute} 
              className="text-green-400 border border-green-400 px-3 py-1.5 rounded hover:bg-green-400 hover:text-black transition"
            >
              Dashboard
            </Link>

            <span className="text-gray-300 text-sm hidden sm:block">
              👋 Hi, <span className="font-semibold">{user.username}</span>
            </span>
            
            <button onClick={handleLogout} className="px-4 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-600 hover:text-white transition">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;