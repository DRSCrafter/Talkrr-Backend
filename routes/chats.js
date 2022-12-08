const express = require("express");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const { validateMessage, Message } = require("../models/message");
const { Chat, validateChat } = require("../models/chat");
const { User } = require("../models/user");
const router = express.Router();

const storage = multer.diskStorage({});

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp"
  )
    callback(null, true);
  else callback(null, false);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

router.post("/", upload.single("chatImage"), async (req, res) => {
  // const { error } = validateChat(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  let chat = new Chat({
    name: req.body.name,
    about: req.body.about,
    members: [],
    isPrivate: req.body.isPrivate,
  });
  const Members = [];

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path);
    chat.chatImage = result.url;
  }

  for (let member of JSON.parse(req.body.members)) {
    if (!member) return res.status(400).send("Invalid Username!");

    const user = await User.findById(member);
    if (!user) return res.status(400).send("Invalid Username!");

    Members.push(member);

    user.chats.push({
      id: chat._id,
    });

    await user.save();
  }

  chat.members = Members;
  await chat.save();

  res.send(chat);
});

router.post("/:id/members/", async (req, res) => {
  const chat = await Chat.findById(req.params.id);
  if (!chat) return res.status(404).send("Chat not found!");

  const user = await User.findById(req.body.id);
  if (!user) return res.status(404).send("User not found!");

  const index = chat.members.findIndex((member) => member.id === req.body.id);
  if (index !== -1) return res.status(400).send("User already registered!");

  user.chats.push({
    id: req.params.id,
    name: chat.name,
  });
  await user.save();

  chat.members.push({
    id: req.body.id,
    name: user.name,
  });
  await chat.save();

  res.send("Successful!");
});

router.put("/:id/members", async (req, res) => {
  const chat = await Chat.findById(req.params.id);
  if (!chat) return res.status(404).send("Chat not found!");

  const user = await User.findById(req.body.id);
  if (!user) return res.status(404).send("User not found!");

  let index = chat.members.findIndex((member) => member === req.body.id);
  if (index === -1) return res.status(400).send("User is not in the chat!");

  index = user.chats.findIndex((chat) => chat.id === req.params.id);
  user.chats.splice(index, 1);
  await user.save();

  index = chat.members.findIndex((member) => member.id === req.body.id);
  chat.members.splice(index, 1);
  await chat.save();

  res.send("Successful!");
});

router.post("/:id/message", async (req, res) => {
  const chat = await Chat.findById(req.params.id);
  if (!chat) return res.status(404).send("Chat not found!");

  const { error } = validateMessage(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const message = new Message({
    sender: req.body.sender,
    content: req.body.content,
  });
  chat.messages.push(message);
  await chat.save();

  res.send(message);
});

router.put("/:id/message", async (req, res) => {
  const chat = await Chat.findById(req.params.id);
  if (!chat) return res.status(400).send("Chat not found!");

  const messageId = new ObjectId(req.body.id);
  const index = chat.messages.findIndex((message) =>
    messageId.equals(message._id)
  );
  if (index === -1) return res.status(400).send("Message does not exist!");

  chat.messages[index].content = req.body.content;
  await chat.save();
  res.send(req.body.content);
});

router.delete("/:id", async (req, res) => {
  const verify = await Chat.findById(req.params.id);
  if (!verify) return res.status(400).send("Chat not found!");

  const chat = await Chat.findByIdAndDelete(req.params.id);

  for (let member of chat.members) {
    const user = await User.findById(member);
    user.chats = user.chats.filter((chat) => chat.id != req.params.id);
    await user.save();
  }

  res.send("Success!");
});

router.delete("/:id/message/:messageID", async (req, res) => {
  const chat = await Chat.findById(req.params.id);
  if (!chat) return res.status(400).send("Chat not found!");

  const messageId = new ObjectId(req.params.messageID);

  const index = chat.messages.findIndex((message) =>
    messageId.equals(message._id)
  );
  chat.messages.splice(index, 1);

  await chat.save();
  res.send("Successful!");
});

router.get("/:id", async (req, res) => {
  const chat = await Chat.findById(req.params.id);
  if (!chat) return res.status(400).send("Chat not found!");

  res.send(chat);
});

router.get("/:id/private/:targetId", async (req, res) => {
  const chat = await Chat.findOne({
    $or: [
      { members: [req.params.targetId, req.params.id] },
      { members: [req.params.id, req.params.targetId] },
    ],
    isPrivate: true,
  });
  res.send(chat);
});

module.exports = router;
