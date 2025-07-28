import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FaHome, FaPlus, FaBoxOpen } from "react-icons/fa";
import { HiOutlineClipboardList } from "react-icons/hi";
import { IoIosArrowForward } from "react-icons/io";
import axios from "axios";

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user || !user._id) return;

    console.log("✅ Logged in user:", user);

    const fetchGigsAndOrders = async () => {
      try {
        const [gigsRes, ordersRes] = await Promise.all([
          axios.get(`/api/gigs/user/${user._id}`),
          axios.get(`/api/orders/received/${user._id}`),
        ]);

        setGigs(gigsRes.data || []);
        setOrders(ordersRes.data || []);

        console.log("✅ Gigs fetched:", gigsRes.data);
        console.log("✅ Orders fetched:", ordersRes.data);
      } catch (err) {
        console.error("❌ Failed to fetch dashboard data", err);
      }
    };

    fetchGigsAndOrders();
  }, [user]);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">Dashboard</h2>
        <nav className="space-y-4">
          <Link
            to="/dashboard/freelancer"
            className="flex items-center gap-3 p-3 bg-blue-100 text-blue-700 rounded-lg font-medium"
          >
            <FaHome /> Home
          </Link>
          <Link
            to="/dashboard/freelancer/gigs"
            className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg"
          >
            <HiOutlineClipboardList /> My Gigs
          </Link>
          <Link
            to="/dashboard/freelancer/add-gig"
            className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg"
          >
            <FaPlus /> Add Gig
          </Link>
          <Link
            to="/dashboard/freelancer/orders"
            className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg"
          >
            <FaBoxOpen /> Orders
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          👨‍💻 Freelancer Dashboard
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome back, <span className="font-semibold text-blue-600">{user?.username}</span> 👋
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gigs Card */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">My Gigs</h2>
            
            <Link
              to="/dashboard/freelancer/gigs"
              className="text-blue-600 font-medium flex items-center hover:underline"
            >
              View Gigs <IoIosArrowForward />
            </Link>
          </div>

          {/* Orders Card */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Received Orders</h2>
            
            <Link
              to="/dashboard/freelancer/orders"
              className="text-blue-600 font-medium flex items-center hover:underline"
            >
              View Orders <IoIosArrowForward />
            </Link>
          </div>
        </div>

        {/* Placeholder */}
        <div className="mt-16 text-center text-gray-400 text-sm">
          More analytics and widgets coming soon...
        </div>
      </main>
    </div>
  );
};

export default FreelancerDashboard;
