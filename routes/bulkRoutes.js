import express from "express";
import {
  createNewBulkSend,
  deleteBulkById,
  getAllBulks,
  getBulkById,
  sendMessageTemplate,
  streamCheck,
  updateBulkById,
} from "../controllers/bulkController.js";
const router = express.Router();

router.post("/new", createNewBulkSend);
router.get("/", getAllBulks);
router
  .get("/:id", getBulkById)
  .delete("/:id", deleteBulkById)
  .put("/:id", updateBulkById);
router.post("/sendTemplate", sendMessageTemplate);
router.get("/stream", streamCheck);
export default router;
