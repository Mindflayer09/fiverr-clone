import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getLoggedInUser } from "../utils/getLoggedInUser";
import axios from "axios";
import OrderCard from "../components/OrderCard";

const ClientDashboard = () => {
  const user = getLoggedInUser();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchClientOrders = async () => {
      try {
        const res = await axios.get(`/api/orders/client/${user._id}`);
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching client orders", err);
      }
    };

    if (user?._id) {
      fetchClientOrders();
    }
  }, [user]);

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
      <h1 className="text-3xl font-bold text-gray-800 mb-4">👤 Client Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome, <span className="font-semibold text-gray-800">{user?.username}</span>
      </p>

      {orders.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-700 text-lg font-semibold opacity-80">
            Your Dashboard content will be displayed here..
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
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
    </DashboardLayout>
  );
};

export default ClientDashboard;
