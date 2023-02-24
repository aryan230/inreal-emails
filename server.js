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
dotenv.config();
connectDB();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
app.use(cors());
app.use(express.json());

app.get("/api/chats", async (req, res) => {
  const numberID = Number(req.body.number);
  const messages = await Messages.find({ numberID });
  res.json(messages);
});

app.post("/webhook", async (req, res) => {
  // Parse the request body from the POST
  let body = req.body;
  console.log(body);
  // Check the Incoming webhook message

  const firebaseSet = async (from, name, messageID, msg_body, timestamp) => {
    const user = await User.findOne({ from });
    if (user) {
      const message = await Messages.create({
        user: user._id,
        messageID,
        text: msg_body,
        number: from,
        timestamp: Date.now(),
      });
      if (message) {
        sendMessage(message);
        res.status(201);
      } else {
        res.status(400);
        throw new Error("Invalid User data");
      }
    } else {
      const user = await User.create({
        name,
        number: from,
        timestamp: Date.now(),
      });
      const message = await Messages.create({
        user: user._id,
        messageID,
        text: msg_body,
        number: from,
        timestamp: Date.now(),
      });
      if (message) {
        res.status(201);
      } else {
        res.status(400);
        throw new Error("Invalid User data");
      }
    }
  };

  const updateStatusFirebase = async (from, status, id) => {
    let messageRef = db.collection("messages").doc(from);
    let customerRef = db.collection("messages");
    const doc = await messageRef.get();
    let data = doc.data().data;
    let dataIndex = data.findIndex((obj) => obj.messageID === id);

    data[dataIndex].status = status;
    console.log(data);
    await customerRef.doc(from).update({
      data: data,
    });
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

io.on("connection", async (socket) => {
  console.log(socket.id);
  const users = await User.find();
  socket.emit("users", users);
  const sendMessage = async (message) => {
    socket.emit("message_received", message);
  };
  socket.on("disconnect", () => {
    console.log(socket.id, "Disconnected");
  });
});
