import mongoose from 'mongoose';

const ChatRoomSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    archivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('ChatRoom', ChatRoomSchema);