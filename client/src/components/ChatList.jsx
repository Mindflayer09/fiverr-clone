import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import moment from "moment";

const socket = io("http://localhost:5000");

const ChatList = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [contacts, setContacts] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Socket Join + Online Status
  useEffect(() => {
    if (!user?._id) return;
    socket.emit("join", user._id);
    socket.on("onlineUsers", (users) => setOnlineUsers(users));
    return () => socket.off("onlineUsers");
  }, []);

  // Fetch Orders and Chat Contacts
  useEffect(() => {
    const fetchChatUsers = async () => {
      const res = await axios.get(`http://localhost:5000/api/orders/user/${user._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const partnerIds = res.data.map((order) =>
        user.role === "client" ? order.sellerId : order.buyerId
      );

      const uniqueIds = [...new Set(partnerIds.map((u) => u._id))];

      const chatList = await Promise.all(
        uniqueIds.map(async (id) => {
          const userRes = await axios.get(`http://localhost:5000/api/auth/user/${id}`);
          const msgRes = await axios.get(
            `http://localhost:5000/api/messages/${user._id}/${id}`,
            {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }
          );
          const lastMsg = msgRes.data[msgRes.data.length - 1];
          return {
            ...userRes.data,
            lastMessage: lastMsg?.content || "No messages yet",
            lastTime: lastMsg?.createdAt || null,
          };
        })
      );

      setContacts(chatList);
    };

    fetchChatUsers();
  }, []);

  return (
    <div className="w-full sm:w-80 h-screen bg-white border-r shadow-md p-4 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">💬 Chats</h2>

      {contacts.map((c) => (
        <Link
          key={c._id}
          to={`/chat/${c._id}`}
          className="flex items-center justify-between gap-3 p-3 mb-3 rounded-lg hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Avatar or Initial */}
            <div className="relative w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-semibold uppercase">
              {c?.profilePic ? (
                <img
                  src={c.profilePic}
                  alt={c.username}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                c.username?.charAt(0)
              )}
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${
                  onlineUsers.includes(c._id) ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1">
              <span className="font-medium text-gray-800 truncate">{c.username}</span>
              <span className="text-sm text-gray-600 truncate">
                {c.lastMessage.length > 30
                  ? c.lastMessage.slice(0, 30) + "..."
                  : c.lastMessage}
              </span>
            </div>
          </div>

          {/* Time */}
          {c.lastTime && (
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {moment(c.lastTime).fromNow()}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
};

export default ChatList;
