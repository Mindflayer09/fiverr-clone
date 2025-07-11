import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import OrderCard from "../components/OrderCard";
import { getLoggedInUser } from "../utils/getLoggedInUser";

const FreelancerDashboard = () => {
  const [gigs, setGigs] = useState([]);
  const [orders, setOrders] = useState([]);
  const user = getLoggedInUser();

  useEffect(() => {
    axios
      .get(`/api/gigs/user/${user._id}`)
      .then((res) => setGigs(res.data))
      .catch((err) => console.error("Failed to fetch gigs", err));

    axios
      .get(`/api/orders/user/${user._id}`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Failed to fetch orders", err));
  }, [user]);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">🧑‍💻 Freelancer Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {user?.username}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Gigs</h2>
        {gigs.length === 0 ? (
          <p className="text-gray-500 italic">No gigs created yet.</p>
        ) : (
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {gigs.map((gig) => (
              <li key={gig._id}>{gig.title}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Orders to Fulfill</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 italic">No orders assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default FreelancerDashboard;
