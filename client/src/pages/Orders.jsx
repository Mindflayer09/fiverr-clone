import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // ✅ Added Link for chat routing
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// ✅ Fixed the literal string bug here so it actually reads your env variable!
const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const Orders = () => {
  const { user, token, loading } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.id || !token) {
        console.warn("🔒 Missing user or token in AuthContext");
        return;
      }

      try {
        const res = await axios.get(`${BASE_URL}/api/orders/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch orders:", err.response?.data || err.message);
      }
    };

    fetchOrders();
  }, [user, token]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${BASE_URL}/api/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("❌ Status update failed:", err);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "in progress":
        return "bg-blue-100 text-blue-700";
      case "delivered":
        return "bg-purple-100 text-purple-700";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 mt-20">Loading orders...</p>;
  }

  const isFreelancer = user?.role?.toLowerCase() === "freelancer";

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        {isFreelancer ? "📥 Orders Received" : "📦 Orders Placed"}
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
          No orders found.
        </p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            // ✅ Determine who the current user should chat with
            const chatPartnerId = isFreelancer 
              ? (order.buyerId?._id || order.buyerId) 
              : (order.sellerId?._id || order.sellerId);

            return (
              <div
                key={order._id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  
                  {/* Order Details */}
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      🎯 Gig:{" "}
                      {order.gigId?.title ? (
                        <span className="text-blue-600">{order.gigId.title}</span>
                      ) : (
                        <span className="text-red-500 italic">[Deleted Gig]</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      🗓️ Ordered On: <span className="font-medium text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      🆔 Order ID: <span className="font-mono text-xs bg-gray-100 px-1 rounded">{order._id}</span>
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center">
                    <span
                      className={`text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wide ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* ✅ Action Buttons (Message & Approve) */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                  
                  {/* Message Button (Visible to BOTH) */}
                  {chatPartnerId && (
                    <Link
                      to={`/chat/${chatPartnerId}`}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition font-medium text-sm border border-gray-200"
                    >
                      💬 Message {isFreelancer ? "Client" : "Freelancer"}
                    </Link>
                  )}

                  {/* Approve Button (Visible ONLY to Freelancers, hides when completed) */}
                  {isFreelancer && order.status !== "completed" && (
                    <button
                      onClick={() => handleStatusChange(order._id, "completed")}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition font-medium text-sm shadow-sm"
                    >
                      ✅ Approve & Complete
                    </button>
                  )}
                  
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;