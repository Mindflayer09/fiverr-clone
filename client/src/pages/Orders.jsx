import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:5000";

const Orders = () => {
  const { user, token, loading } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id || !token) {
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
    return <p className="text-center text-gray-500 mt-10">Loading orders...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        📦 My Orders
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No orders found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                {/* Order Details */}
                <div>
                  <p className="text-lg font-semibold text-gray-800 mb-1">
                    🎯 Gig:{" "}
                    {order.gigId?.title || (
                      <span className="text-red-500 italic">[Deleted Gig]</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    🗓️ Ordered On:{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  {order.buyerId?.username && (
                    <p className="text-sm text-gray-500 mt-1">
                      👤 Client: {order.buyerId.username}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex flex-col md:items-end">
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full mb-2 inline-block w-fit ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status.toUpperCase()}
                  </span>

                  {/* Status Dropdown (Only for freelancers) */}
                  {user?.role === "freelancer" && (
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="border border-gray-300 rounded px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="pending">Pending</option>
                      <option value="in progress">In Progress</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
