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
          Authorization: `Bearer EAARBNj3J3kgBAKiZCFY70VbIidjRYlix2WYLKLZCvie8NFHkk4GUVSbfs2JaPQYykCcrK7Py3Rcdioi8kg5fyZCZCVXcZBq0XatjterXcsFGfI03oE69MWvI0u6F2HzDZCIcoCPKpOBVWI8b3uZAE5UjGSAhUpHmExEdr5v0xULe98b60u4TrpsIl72GY8C07ZAyRLI3AkZBDFAZDZD`,
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
    res.json(err);
  }
});

const sendSingleMessageTemplate = asyncHandler(async (req, res) => {
  const { message, number } = req.body;

  try {
    const response = await axios.post(
      "https://graph.facebook.com/v15.0/103390155979999/messages",
      // '{\n    "messaging_product": "whatsapp",\n    "to": "917045013337",\n    "type": "template",\n    "template": {\n        "name": "hello_world",\n        "language": {\n            "code": "en_US"\n        }\n    }\n}',
      {
        messaging_product: "whatsapp",
        to: number,
        type: "template",
        template: {
          name: "chatgpt1",
          language: {
            code: "en",
          },
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "image",
                  image: {
                    link: "https://i.ibb.co/30g7hh9/Slide-16-9-1-1.png",
                  },
                },
              ],
            },
          ],
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer EAARBNj3J3kgBAKiZCFY70VbIidjRYlix2WYLKLZCvie8NFHkk4GUVSbfs2JaPQYykCcrK7Py3Rcdioi8kg5fyZCZCVXcZBq0XatjterXcsFGfI03oE69MWvI0u6F2HzDZCIcoCPKpOBVWI8b3uZAE5UjGSAhUpHmExEdr5v0xULe98b60u4TrpsIl72GY8C07ZAyRLI3AkZBDFAZDZD",
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
    res.json(err);
  }
});

export { sendSingleMessage, sendSingleMessageTemplate };
