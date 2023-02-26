import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import sendAnEmail from "./routes/sendAnEmail.js";
import cors from "cors";
import path from "path";
import nodemailer from "nodemailer";
import admin from "firebase-admin";
import { getDatabase } from "firebase-admin/database";
import axios from "axios";
import { Server } from "socket.io";
import http from "http";
import User from "./models/userModel.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import Messages from "./models/messages.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();
connectDB();
const app = express();
const server = http.createServer(app);
global.io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
app.use(cors());
app.use(express.json());

app.post("/api/update/unreadMsg", async (req, res) => {
  const { number } = req.body;
  const user = await User.findOne({ number });
  user.unreadMessages = 0;
  const updatedUser = await user.save();
  res.status(200).json(updatedUser);
});

app.post("/test/webhook", async (req, res) => {
  const firebaseSet = async (from, name, messageID, msg_body, timestamp) => {
    const user = await User.findOne({ number: from });
    if (user) {
      console.log("User Found");
      const message = await Messages.create({
        user: user._id,
        messageID,
        text: msg_body,
        number: from,
        timestamp: Date.now(),
        unreadMsg: true,
      });
      if (message) {
        user.timestamp = Date.now();
        user.lastMessage = msg_body;
        user.unreadMessages = user.unreadMessages + 1;
        const updatedUser = await user.save();
        io.emit("message_came", message);
        res.status(201);
        res.json(updatedUser);
      } else {
        res.status(400);
        throw new Error("Invalid User data");
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
        unreadMsg: true,
      });
      if (message) {
        newUser.timestamp = Date.now();
        newUser.lastMessage = msg_body;
        newUser.unreadMessages = newUser.unreadMessages + 1;
        const updatedUser = await newUser.save();
        io.emit("message_came", message);
        res.status(201);
        res.json(updatedUser);
      } else {
        res.status(400);
        throw new Error("Invalid User data");
      }
    }
  };
  if (req.body) {
    const { from, name, messageID, msg_body } = req.body;
    firebaseSet(from, name, messageID, msg_body);
  }
});

app.put("/api/update", async (req, res) => {
  const { id } = req.body;
  const message = await Messages.findOne({ messageID: id });
  if (message) {
    res.json(message);
  } else {
    throw new Error("Not Found");
  }
});

app.post("/api/chats", async (req, res) => {
  const { number } = req.body;
  console.log(number);
  const messages = await Messages.find({ number: number });
  res.json(messages);
});

app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post("/webhook", async (req, res) => {
  // Parse the request body from the POST
  let body = req.body;
  console.log(body);
  // Check the Incoming webhook message

  const firebaseSet = async (from, name, messageID, msg_body, timestamp) => {
    const user = await User.findOne({ number: from });
    if (user) {
      console.log("User Found");
      const message = await Messages.create({
        user: user._id,
        messageID,
        text: msg_body,
        number: from,
        timestamp: Date.now(),
        unreadMsg: true,
      });
      if (message) {
        user.timestamp = Date.now();
        user.lastMessage = msg_body;
        user.unreadMessages = user.unreadMessages + 1;
        const updatedUser = await user.save();
        io.emit("message_came", message);
        res.status(201);
        res.json(updatedUser);
      } else {
        res.status(400);
        throw new Error("Invalid User data");
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
        unreadMsg: true,
      });
      if (message) {
        newUser.timestamp = Date.now();
        newUser.lastMessage = msg_body;
        newUser.unreadMessages = newUser.unreadMessages + 1;
        const updatedUser = await newUser.save();
        io.emit("message_came", message);
        res.status(201);
        res.json(updatedUser);
      } else {
        res.status(400);
        throw new Error("Invalid User data");
      }
    }
  };

  const updateStatusFirebase = async (from, status, id) => {
    const message = await Messages.findOne({ messageID: id });
    if (message) {
      message.status = status;
      const updatedMessage = await message.save();
      io.emit("status_change", updatedMessage);
    }
  };
  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from;
      let messageID = req.body.entry[0].changes[0].value.messages[0].id;
      let name = req.body.entry[0].changes[0].value.contacts[0].profile.name;
      let timestamp = req.body.entry[0].changes[0].value.messages[0].timestamp;
      if (req.body.entry[0].changes[0].value.messages[0].type === "text") {
        let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;
        firebaseSet(from, name, messageID, msg_body, timestamp);
      } else if (
        req.body.entry[0].changes[0].value.messages[0].type === "reaction"
      ) {
        let msg_body =
          req.body.entry[0].changes[0].value.messages[0].reaction.emoji;
        firebaseSet(from, name, messageID, msg_body, timestamp);
      } else if (
        req.body.entry[0].changes[0].value.messages[0].type === "button"
      ) {
        let msg_body =
          req.body.entry[0].changes[0].value.messages[0].button.text;
        firebaseSet(from, name, messageID, msg_body, timestamp);
      } else if (
        req.body.entry[0].changes[0].value.messages[0].type === "interactive"
      ) {
        let msg_body =
          req.body.entry[0].changes[0].value.messages[0].interactive
            .button_reply.title;
        firebaseSet(from, name, messageID, msg_body, timestamp);
      } else {
        let msg_body = "Something different";
        firebaseSet(from, name, messageID, msg_body, timestamp);
      }
    } else if (req.body.entry[0].changes[0].value.statuses[0].status) {
      let from = req.body.entry[0].changes[0].value.statuses[0].recipient_id;
      const status = req.body.entry[0].changes[0].value.statuses[0].status;
      console.log(status);
      const id = req.body.entry[0].changes[0].value.statuses[0].id;
      updateStatusFirebase(from, status, id);
    }
    res.sendStatus(200);
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
});

// if () {
//   const status = req.body.entry[0].changes[0].value.statuses[0].status;
//   console.log(status);
//   const id = req.body.entry[0].changes[0].value.statuses[0].id;
//   updateStatusFirebase(from, status, id);
// } else {
//   let msg_body = "Something different";
//   firebaseSet(from, name, messageID, msg_body, timestamp);
// }
io.on("connection", async (socket) => {
  console.log(socket.id);
  socket.on("disconnect", () => {
    console.log(socket.id, "Disconnected");
  });
});

app.use("/api/messages", messageRoutes);

app.get("/webhook", (req, res) => {
  /**
   * UPDATE YOUR VERIFY TOKEN
   *This will be the Verify Token value when you set up webhook
   **/
  const verify_token = process.env.VERIFY_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});
app.use("/api/email", sendAnEmail);
app.get("/", (req, res) => {
  res.send("Api is running smoothly with http and express");
});
const PORT = process.env.PORT;
app.use(notFound);
app.use(errorHandler);
server.listen(
  process.env.PORT || 3001,
  console.log("Server running on port " + PORT)
);
