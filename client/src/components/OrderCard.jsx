import { format } from "date-fns";
import { FaCalendarAlt, FaUser, FaComments } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const OrderCard = ({ order, isReceived = false, onStatusChange }) => {
  const navigate = useNavigate();

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
    completed: "bg-green-100 text-green-700",
  };

  const formattedDate = order.createdAt
    ? format(new Date(order.createdAt), "dd/MM/yyyy")
    : "N/A";

  const handleMessageClient = () => {
    if (order?.buyer?._id) {
      navigate(`/chat/${order.buyer._id}`);
    } else {
      alert("Client information not found.");
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1">
          {/* Gig Title */}
          <p className="text-lg font-semibold text-gray-900">
            🎯 {order.gigId?.title || "Deleted Gig"}
          </p>

          {/* Buyer Info */}
          {isReceived && order.buyer && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <FaUser className="text-gray-400" />
              <span>Client: {order.buyer.username}</span>
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
          className={`text-xs font-semibold px-3 py-1 rounded-full capitalize whitespace-nowrap ${statusStyles[order.status] || "bg-gray-100 text-gray-600"}`}
        >
          {order.status}
        </span>
      </div>

      {/* Action Buttons */}
      {isReceived && (
        <div className="flex flex-wrap gap-3 mt-4">
          {order.status === "pending" && (
            <>
              <button
                className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 text-sm font-medium transition"
                onClick={() => onStatusChange(order._id, "accepted")}
              >
                ✅ Accept
              </button>
              <button
                className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 text-sm font-medium transition"
                onClick={() => onStatusChange(order._id, "rejected")}
              >
                ❌ Reject
              </button>
            </>
          )}

          {/* 💬 Message Button */}
          <button
            onClick={handleMessageClient}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition"
          >
            <FaComments /> Message Client
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
