// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.warn("🔒 User is not logged in");
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.warn("🚫 User role mismatch");
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
