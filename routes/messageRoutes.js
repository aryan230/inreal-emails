import express from "express";
import {
  sendSingleMessage,
  sendSingleMessageTemplate,
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/send", sendSingleMessage);
router.post("/msg", sendSingleMessageTemplate);

export default router;
