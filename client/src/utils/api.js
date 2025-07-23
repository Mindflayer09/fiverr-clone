import axios from "axios";

export const getMessagesByRoom = async (roomId) => {
  try {
    const res = await axios.get(`/api/messages/${roomId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching messages:", err);
    return [];
  }
};
