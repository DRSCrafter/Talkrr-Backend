import express from "express";
import multer from "../utils/multer";
import * as userController from '../controllers/userController';
import auth from "../middlewares/auth";

const router = express.Router();

router.post("/", multer.single("profileImage"), userController.postUser);

router.post("/login", userController.login);

router.post("/contacts/:id", auth, userController.postContact);

router.post("/pin/:id", auth, userController.postPin);

router.put("/", auth, userController.editUser);

router.put("/unpin/:id", auth, userController.removePin);

router.put("/contacts", auth, userController.removeContact);

router.get("/contacts", auth, userController.getContacts);

router.get("/", auth, userController.getUser);

router.get("/contacts/:id", userController.getContact);

router.get("/strict/list", userController.getStrictList);

router.get("/strict/:id", userController.getStrictOne);

export default router;