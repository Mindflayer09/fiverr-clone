import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    name: { type: String }, 
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isGroup: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("ChatRoom", chatRoomSchema);
