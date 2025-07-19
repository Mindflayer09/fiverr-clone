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
        // Fetch freelancer's gigs (optional display)
        const gigsRes = await axios.get(`/api/gigs/user/${user._id}`);
        setGigs(gigsRes.data);

        // Fetch received orders and populate gig + client info
        const receivedRes = await axios.get(`/api/orders/received/${user._id}`);
        setReceivedOrders(receivedRes.data || []);
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

  const handleApprove = async (orderId) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, {
        status: "completed",
      });
      handleStatusChange(orderId, "completed");
    } catch (err) {
      console.error("❌ Failed to approve order:", err);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="pb-10">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🧑‍💻</span>
            <h1 className="text-3xl font-bold text-gray-900">
              Freelancer Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg mt-1">
            Welcome back,{" "}
            <span className="font-semibold lowercase">{user?.username}</span> 👋
          </p>
           <p className="text-center font-semibold py-10 mt-24 text-gray-500 text-lg">
            Your Dashboard content will be displayed here..
        </p>
        </div>
      </div>

      {/* Orders Section */}
      <section className="mt-10">
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
      </section>
    </DashboardLayout>
  );
};

export default FreelancerDashboard;
