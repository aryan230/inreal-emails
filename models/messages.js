import mongoose from "mongoose";
const messagesSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    messageID: {
      type: String,
      required: true,
    },
    text: {
      type: String,
    },
    number: {
      type: Number,
    },
    typeOf: {
      type: Boolean,
    },
    status: {
      type: String,
    },
    timestamp: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Messages = mongoose.model("Messages", messagesSchema);

export default Messages;
