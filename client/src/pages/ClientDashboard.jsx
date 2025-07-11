import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import OrderCard from "../components/OrderCard";
import { getLoggedInUser } from "../utils/getLoggedInUser";

const ClientDashboard = () => {
  const [orders, setOrders] = useState([]);
  const user = getLoggedInUser();

  useEffect(() => {
    axios
      .get(`/api/orders/user/${user._id}`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Failed to fetch orders", err));
  }, [user]);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">👤 Client Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {user?.username}</p>

      <h2 className="text-xl font-semibold mb-2 text-gray-800">Your Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500 italic">You haven't placed any orders yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ClientDashboard;
