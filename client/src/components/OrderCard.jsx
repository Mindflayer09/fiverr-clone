import { format } from "date-fns";
import { FaCalendarAlt, FaUser, FaComments } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const OrderCard = ({ order, isReceived = true, onStatusChange }) => {
  const navigate = useNavigate();

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
  };

  const formattedDate = order?.createdAt
    ? format(new Date(order.createdAt), "dd/MM/yyyy")
    : "Unknown Date";

  const handleCardClick = () => {
    navigate("/orders");
  };

  const handleMessage = (e) => {
    e.stopPropagation();
    if (order?._id) {
      navigate(`/orders/${order._id}/chat`);
    } else {
      alert("Order ID not found.");
    }
  };

  const handleApprove = async (e) => {
    e.stopPropagation();
    try {
      const res = await axios.put(`/api/orders/${order._id}/status`, {
        status: "pending",
      });

      if (res.data.success) {
        onStatusChange(order._id, "completed");
      }
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update order status.");
    }
  };

  console.log("Order:", order);
  const userToDisplay = isReceived ? order.buyerId : order.sellerId;
  const userRole = isReceived ? "Client" : "Freelancer";

  return (
    <div
      onClick={handleCardClick}
      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Header Row */}
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1">
          {/* Gig Title */}
          <p className="text-lg font-semibold text-gray-900">
            🎯 {order?.gigId?.title || "[Deleted Gig]"}
          </p>

          {/* User Info (Client or Freelancer) */}
          {order && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <FaUser className="text-gray-400" />
              <span>
                {userRole} : {userToDisplay?.username || "Unknown"}
              </span>
            </p>
          )}

          {/* Order Date */}
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <FaCalendarAlt className="text-gray-400" />
            <span>Ordered On: {formattedDate}</span>
          </p>
        </div>

        {/* Status Badge */}
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full capitalize whitespace-nowrap ${
            statusStyles[order?.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {(order?.status || "UNKNOWN").toUpperCase()}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-4">
        {isReceived && order?.status === "pending" && (
          <button
            className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 text-sm font-medium transition"
            onClick={handleApprove}
          >
            Approve
          </button>
        )}
        {isReceived && (
          <button
            onClick={handleMessage}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition"
          >
            <FaComments />
            Message
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;


