import Messages from "../models/messages.js";
import asyncHandler from "express-async-handler";
import axios from "axios";
import User from "../models/userModel.js";
const id = process.env.WHATSAPP_ID;
const token = process.env.WHATSAPP_TOKEN;
const version = "v15.0";

const firebaseSet = async (from, name, messageID, msg_body) => {
  const user = await User.findOne({ number: from });
  if (user) {
    console.log("User Found");
    const message = await Messages.create({
      user: user._id,
      messageID,
      text: msg_body,
      number: from,
      timestamp: Date.now(),
      typeOf: true,
    });
    if (message) {
      user.timestamp = Date.now();
      user.lastMessage = msg_body;
      const updatedUser = await user.save();
      io.emit("message_send", message);
    }
  } else {
    console.log("User Not Found");
    const newUser = await User.create({
      name,
      number: from,
      timestamp: Date.now(),
    });
    io.emit("new_user", newUser);
    const message = await Messages.create({
      user: newUser._id,
      messageID,
      text: msg_body,
      number: from,
      timestamp: Date.now(),
      typeOf: true,
    });
    if (message) {
      newUser.timestamp = Date.now();
      newUser.lastMessage = msg_body;
      const updatedUser = await newUser.save();
      io.emit("message_send", message);
    }
  }
};

const sendSingleMessage = asyncHandler(async (req, res) => {
  const { message, number } = req.body;

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v15.0/103390155979999/messages`,
      // '{\n    "messaging_product": "whatsapp",\n    "to": "16315555555",\n    "text": {\n        "body": "hello world!"\n    }\n}',
      {
        messaging_product: "whatsapp",
        to: number,
        text: {
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer EAARBNj3J3kgBABEELqV5zfahD3yqZBwFj9XaEffOiZB6dPK5Adg5Ln9wIfAsie4ZBuVXZAnWG6ZBLwmmtUqX2SuStrTRey0KqvlRzGCmZAKUZCBREqsEprxoN4L3SJZBVlmFy36UoJ4YZAQJ0il5zJOAswWrrOBOn1BAwqUCkbb0NS3ZAfxDizikfN`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status === 200) {
      res.status(200);
      res.json(response.data);
      const name = "Unknown";
      const messageID = response.data.messages[0].id;
      firebaseSet(number, name, messageID, message);
    }
  } catch (err) {
    res.status(400);
    throw new Error("There was an error");
  }
});

export { sendSingleMessage };
