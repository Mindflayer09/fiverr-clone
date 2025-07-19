import { Link, useLocation } from "react-router-dom";
import { getLoggedInUser } from "../utils/getLoggedInUser";

const DashboardLayout = ({ children }) => {
  const user = getLoggedInUser();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  const linkClass = (path) =>
    `block px-4 py-2 rounded-md font-medium transition ${
      isActive(path)
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  // Dynamically route to appropriate dashboard
  const dashboardPath =
    user?.role === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client";

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-white border-r shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

        <nav className="space-y-2">
          <Link to={dashboardPath} className={linkClass(dashboardPath)}>
            🏠 Home
          </Link>

          {user?.role === "freelancer" && (
            <>
              <Link to="/my-gigs" className={linkClass("/my-gigs")}>
                📋 My Gigs
              </Link>
              <Link to="/add-gig" className={linkClass("/add-gig")}>
                ➕ Add Gig
              </Link>
            </>
          )}

          <Link to="/orders" className={linkClass("/orders")}>📦 Orders</Link>
          <Link to="/chat/0" className={linkClass("/chat")}>💬 Chat</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
