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
import twilio from "twilio";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const client = new twilio(
  "ACf1a2dac689f76091adc627ca404c3699",
  "b406b67fec39064923311c951bee8396"
);
const token = process.env.WHATSAPP_TOKEN;
// app.use(cors(corsOptions));
var serviceAccount = {
  type: "service_account",
  project_id: "whatsapp-5ea34",
  private_key_id: "aeee8df57af33c2cb2d81c95678041048f98707a",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC8eC0wqy32wYoJ\n9Cc/CfSCNgqcx4pLUbAuhMtWgJw88eUPa49IL7Zv0+/TfF/l/g2IoyN4KYOF7kLX\npF0UdyXGT1Smy7nBs5CaOdobdnc//jWkuA8ic3S5EHw+w1Hq7cWMDBDOjUPpZ1lM\nppJB25metJerL+UWRPdf6L2zfeCpdw95D0/wGYavUTnc5Ts7VJvIaPTZg39vN1Ge\nMMizjI4clGb84KcwKTXn4gYiy1TUZxUOsyD65VP1tugyzuYHWroaZ55JPHKU/et0\nyBxhTOhz/FTtpK44qPj2l/Nr86LooRVxIWncqA/EnITsCDxS/ayhiabCHKi743o4\nnzuwQuBzAgMBAAECggEAEQ8fqAQWiPtDr1r2InKYOyEBHOfC0MZ4F/3VGeNSQQH0\nJc0qjvIipUSdtJrRY1P3jaKWl03KpdjHHBW4hx2xwZ10oBRYn/vM3ujVoR679ILi\nACLY29lve0DOvi+Xvpf/BYoiC1AmEX5VSubY3jUuVnsqL0iKh9V+PqQmZ5TBPRVt\nkICcMo77uTVHRaE+DWZw0Fd/ooxJIZepgNrmeaaVFzGfS9btXCsb9A1GzBUKCI2C\nCxrmVj5swLWX5Ucy7H4/0nTNbfNb+nTgfJLRn65PnCa39T/1MtLH68Ddeg17+kbF\nkS0YC8jtsa1VMhQM6sxai+RE0+swTG5fHRvoTlgXYQKBgQD+6OPDhroCauKJcqyq\n63gIZWfCe11CENtmCJMjDA59NgyLWbgtQ63531fv6n7RyOjbkpqO2w3dg/9WhcSb\nPzIRvj+JaizUWdLFvdlzQPoWKcn3dG2G/TPYgZgJ+8sr9kBt9pldef6Ed8OcC7MG\n3lxzKpVCbyjIa5SMCW6d1OWXzwKBgQC9RonxbpZP9ErDRygBcEshrkE9rC2tJbRX\nn8h8i9O9yss/AVB5GYQIdIxhbMiJXP2uUviSw/kq32dyInaEn7birRb/LLUUknqZ\ne2hD3HxIFcqdLDqsNGGAf6sZ0bwkcXtq4+OokkOh+Vb5INcQkF4EHRG07lAMLSaO\nZqTnTBHyHQKBgGm50m4QfSnvhxIXHAKwM1LYLFb/r8htEXKab9yDbacFOeK6TaeI\ngKo4tlJt4jfEqsAXaD+EH5YW31rVlJwHdA7j55ppDTruHnuhqIUjGBcFMh2OjrcE\nYfKUnajWZIhRVJvHQgkBRk1PFzSrrY9VvuaNbObnD/VAmZYTe2u/F5MFAoGAYVwa\ncr0uxnvjxSUh9/N6Qh3vYzjg2fLOHFCNgTsvtK3O9F7JtTEh0HObDjY1xSq3Nudp\nA52Y2qvF+1is3DWHjnv4m1O05ZsfQznOfTG6IB5NdaGdoJzlFoMVUReojpptIKOO\npFRwQ64NReLVnaiVI8qMJCR9unWzIoa8BloD1SUCgYBiula0l8w0tLV4FeJuVOAO\niffivJ3XBsLLddCTOT4htsvZiJ4zIueMdyndW5DXlADHK864vl+nK8cAjnbAEi2s\negdJMrLZ6LMWZbSxV36YmVJTyd6+qqzJUb//7C1t2cRtziC1kR+qtzBuhFE2pCsK\nqnyA6yYOl7/rae333asVeg==\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-516bw@whatsapp-5ea34.iam.gserviceaccount.com",
  client_id: "107822561673930150832",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-516bw%40whatsapp-5ea34.iam.gserviceaccount.com",
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

app.get("/firebase", async (req, res) => {
  let messageRef = db.collection("messages").doc("917045013337");
  let customerRef = db.collection("messages");
  const doc = await messageRef.get();
  let data = doc.data().data;
  let dataIndex = data.findIndex(
    (obj) =>
      obj.messageID ===
      "wamid.HBgMOTE3MDQ1MDEzMzM3FQIAERgSMENDMzQ2RTRGQUFFRTMxRTMzAA=="
  );

  data[dataIndex].status = "delivered";
  console.log(data);
});

app.get("/whatsms", async (req, res) => {
  client.messages
    .create({
      from: "whatsapp:+19379666165",
      body: "Your appointment is coming up on July 21 at 3PM",
      to: "whatsapp:+917045013337",
    })
    .then((message) => console.log(message));
});

app.post("/webhook", async (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the Incoming webhook message

  const firebaseSet = async (from, name, messageID, msg_body, timestamp) => {
    let messageRef = db.collection("messages").doc(from);
    let customerRef = db.collection("messages");
    const doc = await messageRef.get();
    if (!doc.exists) {
      let Newchats = [
        {
          number: from,
          name,
          messageID,
          text: msg_body,
          timestamp,
        },
      ];
      await customerRef.doc(from).set({
        data: Newchats,
      });
    } else {
      console.log("Document data:", doc.data());
      let chats = doc.data().data;
      await chats.push({
        number: from,
        name,
        messageID,
        text: msg_body,
        timestamp,
      });
      await customerRef.doc(from).update({
        data: chats,
      });
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
      } else if (req.body.entry[0].changes[0].value.statuses[0].status) {
        const status = req.body.entry[0].changes[0].value.statuses[0].status;
        console.log(status);
        const id = req.body.entry[0].changes[0].value.statuses[0].id;
        updateStatusFirebase(from, status, id);
      } else {
        let msg_body = "Something different";
        firebaseSet(from, name, messageID, msg_body, timestamp);
      }
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
  res.send("Api is running");
});
const PORT = process.env.PORT;
app.listen(
  process.env.PORT || 3001,
  console.log("Server running on port " + PORT)
);
