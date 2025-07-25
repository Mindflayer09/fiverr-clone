import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; 
import { FaComments } from "react-icons/fa"; 
import { toast } from 'react-toastify';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const Orders = () => {
  const { user, token, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id || !token) return;

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
    console.log(`Attempting to change order ${orderId} status to ${newStatus}`);
    try {
      const res = await axios.put(
        `${BASE_URL}/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedOrder = res.data.order;
      
      console.log("Server responded with:", res.data);
      console.log("Updated order for state:", updatedOrder);

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? updatedOrder : order
        )
      );

    } catch (err) {
      console.error("❌ Status update failed:", err.response?.data || err.message);
      toast.error("Failed to update order status.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleMessage = (orderId) => {
    navigate(`/orders/${orderId}/chat`);
  };

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">Loading orders...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        📦 {user?.role === "freelancer" ? "Orders Received" : "Orders Placed"}
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
                <div>
                  <p className="text-lg font-semibold text-gray-800 mb-1">
                    🎯 Gig:{" "}
                    {order.gigId?.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    🗓️ Ordered On:{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  {user?.role === "freelancer" && order.buyerId?.username && (
                    <p className="text-sm text-gray-500 mt-1">
                      👤 Client: {order.buyerId.username}
                    </p>
                  )}
                </div>

                <div className="flex flex-col md:items-end">
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full mb-2 inline-block w-fit ${getStatusStyle(
                      order?.status
                    )}`}
                  >
                    {order?.status ? order.status.toUpperCase() : "UNKNOWN"}
                  </span>

                  {user?.role === "freelancer" && order?.status?.toLowerCase() === "pending" && (
                    <button
                      className="px-4 py-2 rounded-full text-white bg-green-600 hover:bg-green-700 text-sm font-medium transition"
                      onClick={() => handleStatusChange(order._id, "completed")}
                    >
                      Approve
                    </button>
                  )}

                  <button
                    onClick={() => handleMessage(order._id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition mt-2"
                  >
                    <FaComments />
                    Message
                  </button>
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