// client/src/App.jsx

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from "react-router-dom";
import { io } from "socket.io-client";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import MyGigs from "./pages/MyGigs";
import Gigs from "./pages/Gigs";
import GigDetails from "./pages/GigDetails";
import AddGig from "./pages/AddGig";
import Orders from "./pages/Orders";
import Chat from "./pages/Chat";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import { useAuth } from "./context/AuthContext";

const socket = io("http://localhost:5000");

const ChatWrapper = () => {
  const { id } = useParams();
  return <Chat receiverId={id} />;
};

function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?._id) {
      socket.emit("join", user._id);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/gigs" element={<Gigs />} />
          <Route path="/gig/:id" element={<GigDetails />} />
          <Route path="/add-gig" element={<AddGig />} />
          <Route path="/my-gigs" element={<MyGigs />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/chat/:id" element={<ChatWrapper />} />

          {/* ✅ NEW ROLE-BASED REDIRECT FOR /dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {user?.role === "freelancer" ? (
                  <Navigate to="/dashboard/freelancer" />
                ) : user?.role === "client" ? (
                  <Navigate to="/dashboard/client" />
                ) : (
                  <Navigate to="/" />
                )}
              </ProtectedRoute>
            }
          />

          {/* ✅ Specific dashboards */}
          <Route
            path="/dashboard/client"
            element={
              <ProtectedRoute requiredRole="client">
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/freelancer"
            element={
              <ProtectedRoute requiredRole="freelancer">
                <FreelancerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
