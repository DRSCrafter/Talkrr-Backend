import express from "express";
import multer from "../utils/multer";
import * as userController from '../controllers/userController';

const router = express.Router();

router.post("/", multer.single("profileImage"), userController.postUser);

router.put("/login", userController.login);

router.post("/:id/contacts", userController.postContact);

router.post("/:id/pin", userController.postPin);

router.put("/:id", userController.editUser);

router.put("/:id/unpin", userController.removePin);

router.put("/:id/contacts", userController.removeContact);

router.get("/:id/contacts", userController.getContacts);

router.get("/:id", userController.getUser);

router.get("/contacts/:id", userController.getContact);

router.get("/strict/list", userController.getStrictList);

router.get("/strict/:id", userController.getStrictOne);

export default router;