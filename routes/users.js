const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const config = require("config");

const { User, validateUser } = require("../models/user.js");
const { Chat, validateChat } = require("../models/chat.js");
const auth = require("../middlewares/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads/users");
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

router.post("/", upload.single("profileImage"), async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User Already registered!");

  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phoneNumber: req.body.phoneNumber,
    bio: req.body.bio,
  });
  if (req.file) user.profileImage = req.file.path;

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = jwt.sign({ _id: user._id }, config.get("jwtPrivateKey"));
  res.header("x-auth-token", token).send(user);
});

router.put("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("User not found!");

  const isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) return res.status(400).send("Password incorrect!");

  const token = jwt.sign({ _id: user._id }, config.get("jwtPrivateKey"));
  res.header("x-auth-token", token).send(user);
});

router.put("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("User not found!");

  user.name = req.body.name;
  user.password = req.body.password;
  user.phoneNumber = req.body.phoneNumber;
  user.bio = req.body.bio;

  await user.save();
});

router.post("/:id/contacts", async (req, res) => {
  const user = await User.findById(req.body.id);
  if (!user) return res.status(404).send("User not found!");

  const me = await User.findById(req.params.id);
  me.contacts.push(req.body.id);

  await me.save();
  res.send(req.body.id);
});

router.post("/:id/pin", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("User not found!");

  const chat = await Chat.findById(req.body.id);
  if (!chat) return res.status(400).send("Chat not found!");

  user.pins.push(req.body.id);
  await user.save();
});

router.put("/:id/unpin", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("User not found!");

  const chat = await Chat.findById(req.body.id);
  if (!chat) return res.status(400).send("Chat not found!");

  user.pins = user.pins.filter((pin) => pin != req.body.id);
  await user.save();
});

router.put("/:id/contacts", async (req, res) => {
  const user = await User.findById(req.body.id);
  if (!user) return res.status(404).send("User not found!");

  const me = await User.findById(req.params.id);
  me.contacts = me.contacts.filter((contact) => contact != req.body.id);

  await me.save();
  res.send(req.body.id);
});

router.get("/:id/contacts", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("User not found!");

  const contacts = [];

  for (let contact of user.contacts) {
    const user = await User.findById(contact).select("_id name profileImage");
    contacts.push(user);
  }

  return res.send(contacts);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  res.send(user);
});

router.get("/contacts/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -contacts -chats"
  );
  res.send(user);
});

router.get("/strict/list", async (req, res) => {
  const users = await User.find().select("_id name profileImage");

  res.send(users);
});

router.get("/strict/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "name email phoneNumber bio profileImage"
  );
  if (!user) return res.status(400).send("User not found!");

  res.send(user);
});

module.exports = router;
