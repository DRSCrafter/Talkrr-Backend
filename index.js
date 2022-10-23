const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const config = require("config");
const user = require("./routes/users");
const talk = require("./routes/talks");
const auth = require("./routes/auth");
const cors = require("cors");
const { ObjectId } = require("mongodb");
const { Talk } = require("./models/talk");
const { Message } = require("./models/message");

const port = process.env.PORT || 3001;

const app = express();

const server = app.listen(port, () =>
  console.log(`Listening on Port ${port}...`)
);

const io = require("socket.io")(server, {
  cors: { origin: true, credentials: true },
});

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

const clients = [];

io.on("connection", (socket) => {
  socket.on("login", async (data) => {
    const client = {
      socketID: socket.id,
      userID: data,
    };

    clients.push(client);
    socket.emit("log", `${data} is now online...`);
  });

  socket.on("createRoom", async (data) => {
    const talk = await Talk.findById(data.talkID);
    console.log(talk._id.toString());
    const filterClients = clients.filter((client) =>
      data.userIDs.includes(client.userID)
    );
    const clientIDs = filterClients.map((client) => client.socketID);
    console.log("clients", clientIDs);
    for (let clientID of clientIDs)
      io.to(clientID).emit("getRoom", talk._id.toString());
  });

  socket.on("watchRooms", async (data) => {
    socket.join(data);
  });

  socket.on("joinRoom", async (data) => {
    socket.join(`${data}room`);
  });

  socket.on("leaveRoom", async (data) => {
    socket.leave(`${data}room`);
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
      .to(`${data.talkID}room`)
      .emit("message", { ...message, talkID: data.talkID });

    socket.broadcast.to(data.talkID).emit("notify", { talkID: data.talkID });
  });

  socket.on("deleteMessage", async (data) => {
    const talk = await Talk.findById(data.talkID);

    const messageId = new ObjectId(data.messageID);

    const index = talk.messages.findIndex((message) =>
      messageId.equals(message._id)
    );
    talk.messages.splice(index, 1);

    await talk.save();

    socket.broadcast.to(`${data.talkID}room`).emit("removeMessage", data);
  });
});
