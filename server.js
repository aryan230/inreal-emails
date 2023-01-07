import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import sendAnEmail from "./routes/sendAnEmail.js";
import cors from "cors";
import path from "path";
import nodemailer from "nodemailer";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post("/send", async (req, res) => {
  let transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "ankita@thefarsan.in", // generated ethereal user
      pass: "Ankita@03", // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail(
    {
      from: '"Ankita Malik" <ankita@thefarsan.in>', // sender address
      to: "aryan23062001@gmail.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world? ", // plain text body
      html: "<b>Hello world?</b>", // html body
    },
    (err, info) => {
      if (err) {
        return console.log(err);
      } else {
        console.log("Message sent: %s", info.messageId);
      }
    }
  );
});
// app.use(cors(corsOptions));
app.use("/api/email", sendAnEmail);

app.get("/", (req, res) => {
  res.send("Api is running");
});
const PORT = process.env.PORT;
app.listen(
  process.env.PORT || 5000,
  console.log("Server running on port " + PORT)
);
