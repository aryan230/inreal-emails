import Messages from "../models/messages.js";
import asyncHandler from "express-async-handler";
import axios from "axios";
import User from "../models/userModel.js";
import Bulk from "../models/bulkSends.js";
import { Templates } from "../data/templates.js";

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

const createNewBulkSend = asyncHandler(async (req, res) => {
  const { name, image, data, timestamp } = req.body;
  const newBulkSend = await Bulk.create({
    name,
    image,
    data,
    timestamp,
  });
  if (newBulkSend) {
    res.status(201);
    res.json(newBulkSend);
  } else {
    res.status(400);
  }
});

const getBulkById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const bulk = await Bulk.findOne({ _id: id });
  if (bulk) {
    res.status(201);
    res.json(bulk);
  } else {
    res.status(400);
  }
});

const updateBulkById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { number } = req.body;
  const bulk = await Bulk.findOne({ _id: id });
  if (bulk) {
    const findIndex = await bulk.data.findIndex((a) => a.number == number);
    findIndex !== -1 && bulk.data.splice(findIndex, 1);
    console.log(findIndex);
    bulk.data = bulk.data;
    const updatedBulk = await bulk.save();
    res.status(201);
    res.json(updatedBulk);
  } else {
    res.status(400);
  }
});

const deleteBulkById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const bulk = await Bulk.findOne({ _id: id });
  if (bulk) {
    await bulk.remove();
    res.status(201);
    res.json({
      message: "Removed",
    });
  } else {
    res.status(404);
  }
});

const getAllBulks = asyncHandler(async (req, res) => {
  const bulks = await Bulk.find({});
  if (bulks) {
    res.status(201);
    res.json(bulks);
  } else {
    res.status(400);
  }
});

// Send Bulk Message Templates

const sendMessageTemplate = asyncHandler(async (req, res) => {
  const { id, message } = req.body;
  const bulk = await Bulk.findOne({ _id: id });
  const template = Templates.find((o) => o.name === message);
  if (bulk) {
    var bar = new Promise((resolve, reject) => {
      bulk.data.forEach(async (element, index, array) => {
        console.log(element.number);
        const response = await axios.post(
          "https://graph.facebook.com/v15.0/103390155979999/messages",
          // '{\n    "messaging_product": "whatsapp",\n    "to": "917045013337",\n    "type": "template",\n    "template": {\n        "name": "hello_world",\n        "language": {\n            "code": "en_US"\n        }\n    }\n}',
          {
            messaging_product: "whatsapp",
            to: element.number,
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
                "Bearer EAARBNj3J3kgBAKMqZB6yYeq4ydF8HWbmM54DW5E2jKs5pZAaqcsknTSYqZAx1M4hh0Wi5RZBZC3zMaSYHnoDfWOOlIRrNrZCCZB2Nv3VKwAmIEuxaTJOWhu225d7bNLTDQdEfA3t6ZBsXhYb4HLhebu6Q4OeubcypIVt1Khy81j2rlpK9xWj9U04nVRnrnAZCOdHenPzzOue56gZDZD",
            },
          }
        );
        if (response.status === 200) {
          const name = "Unknown";
          const messageID = response.data.messages[0].id;
          firebaseSet(element.number, name, messageID, message);
          if (index === array.length - 1) resolve();
        } else {
          console.log("err");
          if (index === array.length - 1) resolve();
        }
      });
    });
    bar.then(() => {
      res.status(200);
      res.json({
        sent: "Messages Sent",
      });
    });
  }
});

const streamCheck = asyncHandler(async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Allow-Control-Allow-Origin", "*");
  const intervalId = setInterval(() => {
    const date = new Date();
    res.write(`data: ${date}\n\n`);
  }, 1000);
  res.on("close", () => {
    console.log("client disconnected");
    clearInterval(intervalId);
    res.end();
  });
});

export {
  createNewBulkSend,
  getAllBulks,
  getBulkById,
  sendMessageTemplate,
  streamCheck,
  deleteBulkById,
  updateBulkById,
};
