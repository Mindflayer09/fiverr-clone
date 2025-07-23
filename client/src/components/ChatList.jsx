// client/src/pages/ChatList.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const ChatList = () => {
  const { user } = useAuth();
  const [chatUsers, setChatUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?._id) return;

    const fetchChatUsers = async () => {
      try {
        const res = await axios.get(`/api/chat/users/${user._id}`);
        setChatUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch chat users", err);
      }
    };

    fetchChatUsers();
  }, [user]);

  const handleClick = (receiverId) => {
    navigate(`/chat/${receiverId}`);
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Your Chats</h2>

      {chatUsers.length === 0 ? (
        <p className="text-gray-500">You have no chats yet.</p>
      ) : (
        <ul className="space-y-3">
          {chatUsers.map((u) => (
            <li
              key={u._id}
              onClick={() => handleClick(u._id)}
              className="flex items-center gap-4 p-3 hover:bg-gray-100 cursor-pointer rounded-lg border"
            >
              <img
                src={u.profilePicture || "/default-avatar.png"}
                alt={u.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-medium">{u.username}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatList;
