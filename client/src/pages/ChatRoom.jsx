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

    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
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

    setText("");
  };

  useEffect(() => {
    chatBoxRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleDeleteChat = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this chat history? This action cannot be undone and will delete the chat for both you and the other party."
      )
    ) {
      return;
    }
    try {
      // ✅ CORRECTED: The URL should use the `orderId`
      await axios.delete(`${BASE_URL}/api/chat/messages/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Chat history deleted successfully.");
      navigate("/orders");
    } catch (err) {
      console.error("Error deleting chat history:", err);
      toast.error("Failed to delete chat history.");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 max-w-2xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4 border-b pb-4 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Chat for Order: {orderId}
          </h2>
          <button
            onClick={handleDeleteChat}
            className="bg-red-500 text-white font-medium px-4 py-2 rounded-full hover:bg-red-600 transition-colors shadow-md"
          >
            Delete Chat
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 h-96 overflow-y-auto bg-gray-50 flex flex-col gap-4">
          {messages.map((msg, i) => {
            const isMyMessage = (typeof msg.sender === 'object' && msg.sender.id === user.id) || (typeof msg.sender === 'string' && msg.sender === user.id);

            return (
              <div
                key={i}
                className={`flex items-end gap-3 transition-all duration-300 ${
                  isMyMessage
                    ? "self-end flex-row-reverse"
                    : "self-start"
                }`}
              >
                <img
                  src={
                    msg.sender.profilePic ||
                    "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg"
                  }
                  alt={`${msg.sender.username} profile`}
                  className="w-10 h-10 rounded-full object-cover shadow-sm"
                />

                <div
                  className={`p-3 rounded-2xl max-w-xs md:max-w-md shadow-md flex flex-col ${
                    isMyMessage
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <div
                    className={`text-sm font-semibold mb-1 ${
                      isMyMessage
                        ? "text-blue-100"
                        : "text-gray-600"
                    }`}
                  >
                    {isMyMessage ? "You" : msg.sender.username}
                  </div>
                  <p className="text-base break-words">{msg.text}</p>
                  <span
                    className={`text-right text-xs mt-1 ${
                      isMyMessage
                        ? "text-blue-200"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={chatBoxRef} />
        </div>

        <div className="mt-4 flex gap-2 items-center">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white font-medium px-6 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md"
          >
            Send
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatRoom;