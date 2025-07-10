import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }

    // Listen for changes in localStorage (cross-tab logout)
    const handleStorage = () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-black shadow-md px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="text-green-600 font-extrabold text-2xl">
        <Link to="/">Fiverr.</Link>
      </div>

      {/* Links */}
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="text-white hover:text-green-600 transition font-medium"
        >
          HOME
        </Link>
        <Link
          to="/gigs"
          className="text-white hover:text-green-600 transition font-medium"
        >
          GIGS
        </Link>

        {!user ? (
          <>
            <Link
              to="/login"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              LOGIN
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-green-600 border border-green-600 text-white -600 rounded hover:bg-green-100 transition"
            >
              REGISTER
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-gray-600 font-medium">Hello, {user.username}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 transition"
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
