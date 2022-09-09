const { User, validateUser } = require("../models/user.js");
const { Talk, validateTalk } = require("../models/talk.js");
const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User Already registered!");

  user = new User(
    _.pick(req.body, ["name", "email", "password", "phoneNumber", "bio"])
  );
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

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
  console.log(req.body);
  const user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("User not found!");

  const talk = await Talk.findById(req.body.id);
  if (!talk) return res.status(400).send("Talk not found!");

  user.pins.push(req.body.id);
  await user.save();
});

router.put("/:id/unpin", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("User not found!");

  const talk = await Talk.findById(req.body.id);
  if (!talk) return res.status(400).send("Talk not found!");

  user.pins = user.pins.filter((pin) => pin != req.body.id);
  console.log(user.pins);
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

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  res.send(user);
});

router.get("/contacts/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -contacts -talks"
  );
  res.send(user);
});

router.get("/strict/list", async (req, res) => {
  const users = await User.find().select("_id name");

  res.send(users);
});

router.get("/strict/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "name email phoneNumber bio"
  );
  if (!user) return res.status(400).send("User not found!");

  res.send(user);
});

module.exports = router;
