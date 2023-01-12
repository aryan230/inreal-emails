import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import sendAnEmail from "./routes/sendAnEmail.js";
import cors from "cors";
import path from "path";
import nodemailer from "nodemailer";
import admin from "firebase-admin";
import { getDatabase } from "firebase-admin/database";
import File from "./whatsapp-5ea34-firebase-adminsdk-516bw-aeee8df57a.json" assert { type: "json" };
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const token = process.env.WHATSAPP_TOKEN;
// app.use(cors(corsOptions));
var serviceAccount = File;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

app.post("/webhook", async (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  let customerRef = db.collection("messages");

  // Check the Incoming webhook message
  console.log(JSON.stringify(req.body, null, 2));
  await customerRef.doc("vpeluso").set(JSON.stringify(req.body));

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
      let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;
      // extract the message text from the webhook payload
      axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v12.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: "Thanks for reaching out us. An agent will be connected with you in sometime.",
          },
        },
        headers: { "Content-Type": "application/json" },
      });
    }
    res.sendStatus(200);
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
});

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
  res.send("Api is running");
});
const PORT = process.env.PORT;
app.listen(
  process.env.PORT || 3001,
  console.log("Server running on port " + PORT)
);
