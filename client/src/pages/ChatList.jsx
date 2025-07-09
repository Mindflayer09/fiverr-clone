import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const ChatList = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [contacts, setContacts] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    socket.emit("join", user._id);
    socket.on("onlineUsers", (users) => setOnlineUsers(users));
    return () => socket.off("onlineUsers");
  }, []);

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
          const msgRes = await axios.get(`http://localhost:5000/api/messages/${user._id}/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
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
    <div className="w-full sm:w-80 bg-white border-r p-4 h-screen overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">💬 Chats</h2>
      {contacts.map((c) => (
        <Link
          key={c._id}
          to={`/chat/${c._id}`}
          className="block border-b py-3 hover:bg-gray-100 px-2 rounded"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{c.username}</p>
              <p className="text-sm text-gray-600 truncate">{c.lastMessage}</p>
            </div>
            <span
              className={`w-3 h-3 rounded-full ${
                onlineUsers.includes(c._id) ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ChatList;
