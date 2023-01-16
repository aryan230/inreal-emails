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
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
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
  let customerRef = db.collection("messages");
  customerRef.get().then((snap) => {
    snap.forEach(async (element) => {
      if (element.id === "103390155979999") {
        console.log(element.data());
        let chats = element.data().data;
        await chats.push({
          name: "ayaan",
        });

        await customerRef.doc(element.id).set({
          data: chats,
        });
      }
    });
  });
});

app.post("/webhook", async (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  let customerRef = db.collection("messages");

  // Check the Incoming webhook message
  console.log(JSON.stringify(req.body, null, 2));

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
      let messageID = req.body.entry[0].changes[0].value.messages[0].id;
      let name = req.body.entry[0].changes[0].value.contacts[0].profile.name;
      let timestamp = req.body.entry[0].changes[0].value.messages[0].timestamp;
      //Save message in firebase storage
      customerRef.get().then((snap) => {
        snap.forEach(async (element) => {
          if (element.id == phone_number_id) {
            console.log(element.data());
            let chats = element.data().data;
            await chats.push({
              number: from,
              name,
              messageID,
              text: msg_body,
              timestamp,
            });

            await customerRef.doc(element.id).set({
              data: chats,
            });
          } else {
            let chats = [
              {
                number: from,
                name,
                messageID,
                text: msg_body,
                timestamp,
              },
            ];
            await customerRef.doc(phone_number_id).set({
              data: chats,
            });
          }
        });
      });
      // await customerRef
      //   .doc(req.body.entry[0].changes[0].value.metadata.phone_number_id)
      //   .set({
      //     number: req.body.entry[0].changes[0].value.metadata.phone_number_id,
      //   });
      // extract the message text from the webhook payload
      // axios({
      //   method: "POST", // Required, HTTP method, a string, e.g. POST, GET
      //   url:
      //     "https://graph.facebook.com/v12.0/" +
      //     phone_number_id +
      //     "/messages?access_token=" +
      //     token,
      //   data: {
      //     messaging_product: "whatsapp",
      //     to: from,
      //     text: {
      //       body: "Thanks for reaching out to us. An agent will be connected with you in sometime.",
      //     },
      //   },
      //   headers: { "Content-Type": "application/json" },
      // });
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
