import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import OrderCard from "../components/OrderCard";
import { getLoggedInUser } from "../utils/getLoggedInUser";

const ClientDashboard = () => {
  const [orders, setOrders] = useState([]);
  const user = getLoggedInUser();

  useEffect(() => {
    // 1. FATAL CRASH PREVENTION: Stop if user isn't loaded yet
    if (!user) return;
    
    // 2. Safe ID extraction
    const userId = user.id || user._id;
    if (!userId) return; // Stops the "/undefined" bug!

    // 3. Fallback to 5000 if env variable fails (Stops the port 3000 bug!)
    const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

    let token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      token = token.replace(/^"|"$/g, '');
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    axios
      .get(`${baseUrl}/api/orders/user/${userId}`, config)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Failed to fetch orders", err));
      
  // 4. INFINITE LOOP FIX: Only depend on the string ID, not the whole user object
  }, [user?.id, user?._id]);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading dashboard...</div>;
  }

  // Quick calculations for the stats row
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, <span className="font-semibold text-gray-700">{user?.username || "Anonymous"}</span>!
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">📦</div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-2xl">⏳</div>
          <div>
            <p className="text-sm text-gray-500 font-medium">In Progress</p>
            <p className="text-2xl font-bold text-gray-800">{pendingOrders}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">✅</div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed</p>
            <p className="text-2xl font-bold text-gray-800">{completedOrders}</p>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
          <Link to="/orders" className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline">
            View All Orders &rarr;
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 mb-2">You haven't placed any orders yet.</p>
            <Link to="/gigs" className="text-blue-600 font-medium hover:underline">
              Explore gigs to get started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.slice(0, 6).map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default ClientDashboard;