import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import OrderCard from "../components/OrderCard";
import { getLoggedInUser } from "../utils/getLoggedInUser";

const FreelancerDashboard = () => {
  const [gigs, setGigs] = useState([]);
  const [orders, setOrders] = useState([]);
  const user = getLoggedInUser();
  const userId = user?.id || user?._id;

  useEffect(() => {
    if (!user) return;
    const userId = user.id || user._id;
    if (!userId) return;

    const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

    let token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      token = token.replace(/^"|"$/g, '');
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    axios
      .get(`${baseUrl}/api/gigs/user/${userId}`, config)
      .then((res) => setGigs(res.data))
      .catch((err) => console.error("Failed to fetch gigs", err));

    axios
      .get(`${baseUrl}/api/orders/user/${userId}`, config)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Failed to fetch orders", err));
  }, [userId]);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading dashboard...</div>;
  }

  // Quick calculations for the stats row
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  return (
    <DashboardLayout>
      {/* 1. Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back, <span className="font-semibold text-gray-700">{user?.username}</span>!</p>
      </div>

      {/* 2. Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">📄</div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Gigs</p>
            <p className="text-2xl font-bold text-gray-800">{gigs.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-2xl">⏳</div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-800">{pendingOrders || orders.length}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3. Upgraded Gigs Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Your Gigs</h2>
            <Link to="/my-gigs" className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline">
              Manage Gigs &rarr;
            </Link>
          </div>
          
          {gigs.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No gigs created yet.</p>
              <Link to="/add-gig" className="text-blue-600 font-medium mt-2 block hover:underline">Create your first gig</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {gigs.slice(0, 3).map((gig) => ( // Only show top 3 on overview
                <div key={gig._id} className="p-4 border border-gray-100 rounded-lg hover:border-blue-300 hover:shadow-md transition bg-gray-50/50">
                  <h3 className="font-semibold text-gray-800 truncate">{gig.title}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-green-600 font-bold text-sm">₹{gig.price}</span>
                    <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">Active</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. Upgraded Orders Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline">
              View All &rarr;
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 text-sm">No orders assigned yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.slice(0, 3).map((order) => ( // Show recent 3
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerDashboard;