import express from "express";
import { sendSingleMessage } from "../controllers/messageController.js";

const router = express.Router();

router.post("/send", sendSingleMessage);

export default router;
