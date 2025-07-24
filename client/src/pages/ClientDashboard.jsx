import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import OrderCard from "../components/OrderCard";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle, FaBoxOpen } from "react-icons/fa"; 

const ClientDashboard = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchClientOrders = async () => {
      if (!user?.id || !token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${BASE_URL}/api/orders/user/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching client orders", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchClientOrders();
  }, [user?.id, token, BASE_URL]);

  // Update order status locally when changed
  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order._id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 flex items-center">
        <FaUserCircle className="text-4xl text-indigo-600 mr-4" />
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">Client Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome, <span className="font-semibold text-gray-800">{user?.username}</span>
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-200">
            <FaBoxOpen className="text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No orders found.</p>
            <p className="text-gray-400 mt-2 text-center">
              Looks like you haven't placed any orders yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {orders.map(order => (
              <OrderCard
                key={order._id}
                order={order}
                isReceived={false}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;