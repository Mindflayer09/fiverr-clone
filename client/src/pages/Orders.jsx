import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "process.env.REACT_APP_BACKEND_URL";

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
    return <p className="text-center text-gray-500">Loading orders...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">📦 My Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-300 rounded-xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    🎯 Gig:{" "}
                    {order.gigId?.title || (
                      <span className="text-red-500">[Deleted Gig]</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    🗓️ Ordered On: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {user?.role === "freelancer" && (
                <div className="mt-4">
                  <label className="text-sm text-gray-600 font-medium mr-2">
                    Update Status:
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                  >
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
