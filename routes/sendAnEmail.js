import express from "express";
import { sendAnCustomEmail } from "../controllers/sendAnEmailController.js";

const router = express.Router();

router.route("/").post(sendAnCustomEmail);

export default router;
