// client/src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages & Components
import Register from "./pages/Register";
import Login from "./pages/Login";
import MyGigs from "./pages/MyGigs";
import Gigs from "./pages/Gigs";
import GigDetails from "./pages/GigDetails";
import Orders from "./pages/Orders";
import Chat from "./pages/Chat";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AddGig from "./pages/AddGig";

// ✅ 1. Import your new dashboard files here!
import FreelancerDashboard from "./pages/FreelancerDashboard";
import ClientDashboard from "./pages/ClientDashboard";

const socket = io("https://fiverr-clone-r566.onrender.com");

const ChatWrapper = () => {
  const { id } = useParams();
  return <Chat receiverId={id} socket={socket} />;
};

const AppRoutes = () => {
  // ✅ 2. We are pulling ONLY "user" now. No "activeRole" ghosts!
  const { user, userId, loading } = useAuth();

  useEffect(() => {
    if (userId) socket.emit("join", userId);
  }, [userId]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  // ✅ 3. THE ULTIMATE SAFETY CHECK: This removes accidental spaces and capital letters
  const safeRole = user?.role?.trim().toLowerCase();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/gigs" element={<Gigs />} />
        <Route path="/gig/:id" element={<GigDetails />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ✅ 4. THE NEW MASTER DASHBOARD ROUTE */}
        <Route 
          path="/dashboard" 
          element={
            safeRole === "freelancer" ? <FreelancerDashboard /> : 
            safeRole === "client" ? <ClientDashboard /> : 
            <Navigate to="/gigs" />
          } 
        />

        {/* Protected Freelancer Routes */}
        <Route 
          path="/my-gigs" 
          element={safeRole === "freelancer" ? <MyGigs /> : <Navigate to="/gigs" />} 
        />
        <Route 
          path="/add-gig" 
          element={safeRole === "freelancer" ? <AddGig /> : <Navigate to="/gigs" />} 
        />

        {/* Protected Client Routes */}
        <Route 
          path="/orders" 
          element={(safeRole === "client" || safeRole === "freelancer") ? <Orders /> : <Navigate to="/gigs" />} 
        />

        <Route path="/chat/:id" element={user ? <ChatWrapper /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AuthProvider>
        <Router>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;