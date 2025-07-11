// client/src/components/OrderCard.jsx
const OrderCard = ({ order }) => {
  return (
    <div className="bg-white p-4 rounded-md shadow border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <p className="font-medium text-gray-800">
          Gig: {order.gigId?.title || "Deleted Gig"}
        </p>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            order.status === "completed"
              ? "bg-green-100 text-green-700"
              : order.status === "in progress"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {order.status}
        </span>
      </div>
      <p className="text-sm text-gray-600">Order ID: {order._id}</p>
    </div>
  );
};

export default OrderCard;
