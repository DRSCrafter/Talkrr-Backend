import express from 'express';
import * as chatController from '../controllers/chatController';
import multer from "../utils/multer";
import auth from "../middlewares/auth";

const router = express.Router();

router.post("/", [auth, multer.single("chatImage")], chatController.postChat);

router.post("/:id/members/", auth, chatController.postMember);

router.put("/:id/members", auth, chatController.removeMember);

router.post("/:id/message", auth, chatController.postMessage);

router.put("/:id/message", auth, chatController.editMessage);

router.delete("/:id", auth, chatController.deleteChat);

router.delete("/:id/message/:messageID", auth, chatController.deleteMessage);

router.get("/:id", auth, chatController.getChat);

router.get("/:id/private/:targetId", auth, chatController.checkPrivate);

export default router;