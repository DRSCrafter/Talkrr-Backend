import express from 'express';
import * as chatController from '../controllers/chatController';
import multer from "../utils/multer";

const router = express.Router();

router.post("/", multer.single("chatImage"), chatController.postChat);

router.post("/:id/members/", chatController.postMember);

router.put("/:id/members", chatController.removeMember);

router.post("/:id/message", chatController.postMessage);

router.put("/:id/message", chatController.editMessage);

router.delete("/:id", chatController.deleteChat);

router.delete("/:id/message/:messageID", chatController.deleteMessage);

router.get("/:id", chatController.getChat);

router.get("/:id/private/:targetId", chatController.checkPrivate);

export default router;