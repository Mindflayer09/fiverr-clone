import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import ChatRoom from "./pages/ChatRoom";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user } = useAuth();

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
          <Route path="/dashboard/freelancer" element={<FreelancerDashboard />} />
          <Route path="/dashboard/freelancer/gigs" element={<MyGigs />} />
          <Route path="/dashboard/freelancer/orders" element={<Orders />} />
          <Route path="/dashboard/freelancer/add-gig" element={<AddGig />} />

          {/* ✅ Role-based redirect */}
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

          {/* ✅ Dashboards */}
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

          {/* ✅ Chat route (separate protected page) */}
          <Route
            path="/orders/:orderId/chat"
            element={
              <ProtectedRoute>
                <ChatRoom />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
