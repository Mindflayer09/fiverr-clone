import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const socket = io("http://localhost:5000");

const Chat = () => {
  const { receiverId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [chatList, setChatList] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);

  // Load chat room or create
  useEffect(() => {
    if (!user || !receiverId) return;

    const fetchOrCreateRoom = async () => {
      try {
        const { data } = await axios.post("/api/chatrooms/initiate", {
          participants: [user._id, receiverId],
        });
        setCurrentRoom(data._id);
        socket.emit("joinRoom", data._id);
      } catch (error) {
        console.error("Room error:", error);
      }
    };

    fetchOrCreateRoom();
  }, [receiverId, user]);

  // Load existing messages
  useEffect(() => {
    if (!currentRoom) return;

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`/api/messages/${currentRoom}`);
        setMessages(data);
      } catch (error) {
        console.error("Fetch messages failed:", error);
      }
    };

    fetchMessages();
  }, [currentRoom]);

  // Real-time message listener
  useEffect(() => {
    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      const { data } = await axios.post("/api/messages", {
        roomId: currentRoom,
        senderId: user._id,
        text: messageText,
      });

      socket.emit("sendMessage", data);
      setMessageText("");
    } catch (error) {
      console.error("Message send failed:", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Chat List Sidebar */}
      <aside className="hidden md:flex w-1/4 flex-col bg-gray-100 border-r overflow-y-auto">
        <h2 className="text-xl font-semibold p-4 border-b">Chats</h2>
        {chatList.length === 0 ? (
          <p className="p-4 text-gray-500">No chats yet.</p>
        ) : (
          chatList.map((chat) => (
            <div key={chat._id} className="p-4 hover:bg-gray-200 cursor-pointer">
              {chat.name || "Chat"}
            </div>
          ))
        )}
      </aside>

      {/* Main Chat Window */}
      <section className="flex-1 flex flex-col justify-between">
        {!receiverId ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-lg">
            Select a chat to start messaging
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`max-w-xs md:max-w-sm px-4 py-2 rounded-xl ${
                    msg.senderId === user._id
                      ? "bg-green-100 ml-auto"
                      : "bg-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form
              onSubmit={sendMessage}
              className="flex items-center border-t p-2 gap-2 bg-white"
            >
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition"
              >
                Send
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
};

export default Chat;
