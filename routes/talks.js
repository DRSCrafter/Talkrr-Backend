const express = require("express");
const { ObjectId } = require("mongodb");
const multer = require("multer");

const { validateMessage, Message } = require("../models/message");
const { Talk, validateTalk } = require("../models/talk");
const { User } = require("../models/user");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads/talks");
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

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

router.post("/", upload.single("talkImage"), async (req, res) => {
  // const { error } = validateTalk(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  let talk = new Talk({
    name: req.body.name,
    about: req.body.about,
    members: [],
    isPrivate: req.body.isPrivate,
  });
  const Members = [];

  if (req.file) talk.talkImage = req.file.path;
  console.log(talk);

  for (let member of JSON.parse(req.body.members)) {
    if (!member) return res.status(400).send("Invalid Username!");

    const user = await User.findById(member);
    if (!user) return res.status(400).send("Invalid Username!");

    Members.push(member);

    user.talks.push({
      id: talk._id,
    });

    await user.save();
  }

  talk.members = Members;
  await talk.save();

  res.send(talk);
});

router.post("/:id/members/", async (req, res) => {
  const talk = await Talk.findById(req.params.id);
  if (!talk) return res.status(404).send("Talk not found!");

  const user = await User.findById(req.body.id);
  if (!user) return res.status(404).send("User not found!");

  const index = talk.members.findIndex((member) => member.id === req.body.id);
  if (index !== -1) return res.status(400).send("User already registered!");

  user.talks.push({
    id: req.params.id,
    name: talk.name,
  });
  await user.save();

  talk.members.push({
    id: req.body.id,
    name: user.name,
  });
  await talk.save();

  res.send("Successful!");
});

router.put("/:id/members", async (req, res) => {
  const talk = await Talk.findById(req.params.id);
  if (!talk) return res.status(404).send("Talk not found!");

  const user = await User.findById(req.body.id);
  if (!user) return res.status(404).send("User not found!");

  let index = talk.members.findIndex((member) => member === req.body.id);
  if (index === -1) return res.status(400).send("User is not in the talk!");

  index = user.talks.findIndex((talk) => talk.id === req.params.id);
  user.talks.splice(index, 1);
  await user.save();

  index = talk.members.findIndex((member) => member.id === req.body.id);
  talk.members.splice(index, 1);
  await talk.save();

  res.send("Successful!");
});

router.post("/:id/message", async (req, res) => {
  const talk = await Talk.findById(req.params.id);
  if (!talk) return res.status(404).send("Talk not found!");

  const { error } = validateMessage(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const message = new Message({
    sender: req.body.sender,
    content: req.body.content,
  });
  talk.messages.push(message);
  await talk.save();

  res.send(message);
});

router.put("/:id/message", async (req, res) => {
  const talk = await Talk.findById(req.params.id);
  if (!talk) return res.status(400).send("Talk not found!");

  const messageId = new ObjectId(req.body.id);
  const index = talk.messages.findIndex((message) =>
    messageId.equals(message._id)
  );
  if (index === -1) return res.status(400).send("Message does not exist!");

  talk.messages[index].content = req.body.content;
  await talk.save();
  res.send(req.body.content);
});

router.delete("/:id", async (req, res) => {
  const talk = await Talk.findByIdAndDelete(req.params.id);
  if (!talk) return res.status(400).send("Talk not found!");

  for (let member of talk.members) {
    const user = await User.findById(member);
    user.talks = user.talks.filter((talk) => talk.id != req.params.id);
    await user.save();
  }

  res.send("Success!");
});

router.delete("/:id/message/:messageID", async (req, res) => {
  const talk = await Talk.findById(req.params.id);
  if (!talk) return res.status(400).send("Talk not found!");

  const messageId = new ObjectId(req.params.messageID);

  const index = talk.messages.findIndex((message) =>
    messageId.equals(message._id)
  );
  talk.messages.splice(index, 1);

  await talk.save();
  res.send("Successful!");
});

router.get("/:id", async (req, res) => {
  const talk = await Talk.findById(req.params.id);
  if (!talk) return res.status(400).send("Talk not found!");

  res.send(talk);
});

module.exports = router;
