// client/src/pages/ChatWrapper.jsx
import { useParams } from "react-router-dom";
import Chat from "./Chat";

const ChatWrapper = () => {
  const { receiverId } = useParams();
  return <Chat receiverId={receiverId} />;
};

export default ChatWrapper;
