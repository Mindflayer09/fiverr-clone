import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import moment from "moment";

// ✅ Connect to backend's socket.io (NOT frontend)
export const socket = io("http://localhost:5000");

const Chat = ({ receiverId }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const userId = user?._id;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [receiver, setReceiver] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);

  // ✅ Auto-scroll to bottom
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ Setup socket listeners
  useEffect(() => {
    if (!userId) return;

    socket.emit("join", userId);

    socket.on("connect", () => {
      console.log("✅ Connected to Socket.io server");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection failed:", err.message);
    });

    socket.on("receiveMessage", (msg) => {
      if (msg.receiverId === userId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("typing", () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [userId]);

  // ✅ Fetch messages and receiver info
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${userId}/${receiverId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch messages:", err.message);
      }
    };

    const fetchReceiver = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/user/${receiverId}`);
        setReceiver(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch receiver info:", err.message);
      }
    };

    if (userId && receiverId) {
      fetchMessages();
      fetchReceiver();
    }
  }, [receiverId, userId, token]);

  // ✅ Send message
  const handleSend = async () => {
    if (!text.trim()) return;

    const message = {
      senderId: userId,
      receiverId,
      content: text.trim(),
    };

    socket.emit("sendMessage", message);

    try {
      const res = await axios.post("http://localhost:5000/api/messages", message, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => [...prev, res.data]);
      setText("");
    } catch (err) {
      console.error("❌ Message send failed:", err.message);
    }
  };

  // ✅ Emit typing
  const handleTyping = () => {
    socket.emit("typing", { receiverId });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-10 min-h-[85vh] flex flex-col bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
        💬 Chat with {receiver?.username || "User"}
      </h2>

      {/* Messages Container */}
      <div
        ref={chatBoxRef}
        className="flex-1 overflow-y-auto p-4 border rounded-md bg-gray-100 space-y-4 max-h-[60vh]"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col max-w-[70%] px-4 py-2 rounded-lg text-sm ${
              msg.senderId === userId
                ? "bg-blue-600 text-white self-end ml-auto text-right"
                : "bg-gray-300 text-gray-900 self-start"
            }`}
          >
            <span className="font-semibold text-xs mb-1">
              {msg.senderId === userId ? "You" : receiver?.username || "User"}
            </span>
            <span>{msg.content}</span>
            <span className="text-xs mt-1 text-gray-700">
              {moment(msg.createdAt).format("hh:mm A")}
            </span>
          </div>
        ))}
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="text-sm italic text-gray-500 mt-2">Typing...</div>
      )}

      {/* Input Box */}
      <div className="mt-4 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
