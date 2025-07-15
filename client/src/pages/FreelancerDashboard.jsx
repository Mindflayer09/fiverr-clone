import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import OrderCard from "../components/OrderCard";
import { useAuth } from "../context/AuthContext";

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchDashboardData = async () => {
    if (!user?._id) return;

    try {
      // Fetch freelancer's gigs
      const gigsRes = await axios.get(`/api/gigs/user/${user._id}`);
      setGigs(gigsRes.data);

      //  Correct route for received orders
      const receivedRes = await axios.get(`/api/orders/received/${user._id}`);
      setReceivedOrders(receivedRes.data);

    } catch (err) {
      console.error("❌ Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, [user]);

  const handleStatusChange = (orderId, newStatus) => {
    setReceivedOrders((prev) =>
      prev.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-10 text-gray-500 text-lg">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🧑‍💻 Freelancer Dashboard</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Welcome back, <span className="font-semibold">{user?.username}</span> 👋
        </p>

        {/* Gigs Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎨 Your Gigs</h2>
          {gigs.length === 0 ? (
            <p className="text-gray-500 italic">You haven’t created any gigs yet.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs.map((gig) => (
                <li
                  key={gig._id}
                  className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{gig.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {gig.description?.slice(0, 80)}...
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 📥 Orders Placed by Clients Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📥 Orders Placed by Clients</h2>
          {receivedOrders.length === 0 ? (
            <p className="text-gray-500 italic">No one has ordered your gigs yet.</p>
          ) : (
            <div className="space-y-4">
              {receivedOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  isReceived={true}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerDashboard;
