const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const config = require("config");
const user = require("./routes/users");
const talk = require("./routes/talks");
const auth = require("./routes/auth");
const cors = require("cors");
const { Talk } = require("./models/talk");
const { Message } = require("./models/message");

const port = process.env.PORT || 3001;

const app = express();

const server = app.listen(port, () =>
  console.log(`Listening on Port ${port}...`)
);

const io = require("socket.io")(server, { cors: { origin: "*" } });

if (!config.get("jwtPrivateKey")) {
  console.error("Private Key not defined!");
  process.exit(1);
}

mongoose
  .connect("mongodb://localhost/talkrr")
  .then(() => console.log("Connected to MongoDB..."))
  .catch(() => console.log("Connection failed!"));

app.use(express.json());
app.use(cors({ exposedHeaders: "x-auth-token" }));
app.use("/uploads", express.static("uploads"));
app.use("/api/users", user);
app.use("/api/talks", talk);
app.use("/api/auth", auth);

io.on("connection", (socket) => {
  console.log("New client connected...");

  socket.on("watchRooms", async (data) => {
    socket.join(data);
    socket.emit("log", `watching ${data}...`);
  });

  socket.on("joinRoom", async (data) => {
    const talk = await Talk.findById(data);
    socket.emit("talk", talk);
  });

  socket.on("sendMessage", async (data) => {
    const talk = await Talk.findById(data.talkID);

    const message = new Message({
      sender: data.sender,
      content: data.content,
    });

    talk.messages.push(message);
    await talk.save();

    socket.broadcast
      .to(data.talkID)
      .emit("message", { ...message, talkID: data.talkID });
  });
});
