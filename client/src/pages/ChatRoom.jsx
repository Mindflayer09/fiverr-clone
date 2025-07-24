import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { toast } from "react-toastify";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

const ChatRoom = () => {
  const { orderId } = useParams();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const chatBoxRef = useRef(null);
  const BASE_URL = "http://localhost:5000";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatMessages = async () => {
      if (!user?.id || !token || !orderId) {
        return;
      }
      try {
        const res = await axios.get(
          `${BASE_URL}/api/chat/messages/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching chat messages", err);
      }
    };
    fetchChatMessages();
  }, [user?.id, token, orderId, BASE_URL]);

  useEffect(() => {
    socket.emit("joinRoom", orderId);

    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
    }
  }, [orderId]);

  const handleSend = async () => {
    if (!text.trim()) return;

    const message = {
      room: orderId,
      sender: user.id,
      text,
      createdAt: new Date().toISOString(),
    };
    socket.emit("sendMessage", message);

    try {
      await axios.post(
        `${BASE_URL}/api/chat/message`,
        {
          roomId: orderId,
          text,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Error saving message:", err);
    }
    
    // ✅ FIX: This is the line that must be removed.
    // The message will be added to the state via the socket listener.
    // setMessages((prev) => [...prev, message]);
    
    setText("");
  };

  useEffect(() => {
    chatBoxRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleDeleteChat = async () => {
    if (!window.confirm("Are you sure you want to delete this chat history? This action cannot be undone.")) {
      return;
    }
    try {
      await axios.delete(`${BASE_URL}/api/chat/messages/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      toast.success("Chat history deleted successfully.");
      navigate('/orders'); 
      
    } catch (err) {
      console.error("Error deleting chat history:", err);
      toast.error("Failed to delete chat history.");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 max-w-2xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Chat for Order: {orderId}</h2>
          <button 
            onClick={handleDeleteChat} 
            className="bg-red-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Chat
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 h-96 overflow-y-auto bg-gray-50 flex flex-col gap-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl max-w-xs transition-all duration-300 ${
                msg.sender === user.id ? "bg-indigo-500 text-white self-end" : "bg-gray-200 text-gray-800 self-start"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          ))}
          <div ref={chatBoxRef} />
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <button
            onClick={handleSend}
            className="bg-indigo-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatRoom;