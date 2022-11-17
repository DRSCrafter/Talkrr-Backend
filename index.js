const express = require("express");
const mongoose = require("mongoose");
const config = require("config");

const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const cors = require("cors");
const { ObjectId } = require("mongodb");
const { Chat } = require("./models/chat");
const { User } = require("./models/user");
const { Message } = require("./models/message");

const port = process.env.PORT || 3001;

const app = express();

require("./startup/routes")(app);
require("./startup/prod")(app);

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

const db = config.get("db");

mongoose
  .connect(db)
  .then(() => console.log("Connected to MongoDB..."))
  .catch(() => console.log("Connection failed!"));

app.use(express.json());
app.use(cors({ exposedHeaders: "x-auth-token" }));
app.use("/uploads", express.static("uploads"));
app.use("/api/users", user);
app.use("/api/chats", chat);
app.use("/api/auth", auth);

const clients = [];

const findClientSet = (id) => {
  const clientset = clients.filter((client) => client.userID == id);
  return clientset.map((client) => client.socketID);
};

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
    const chat = await Chat.findById(data.chatID);
    const filterClients = clients.filter((client) =>
      data.userIDs.includes(client.userID)
    );
    const clientIDs = filterClients.map((client) => client.socketID);
    for (let clientID of clientIDs)
      io.to(clientID).emit("getRoom", chat._id.toString());
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
    const chat = await Chat.findById(data.chatID);

    const message = new Message({
      sender: data.sender,
      content: data.content,
    });

    chat.messages.push(message);
    await chat.save();

    socket.broadcast
      .to(`${data.chatID}room`)
      .emit("message", { ...message, chatID: data.chatID });

    socket.broadcast.to(data.chatID).emit("notify", { chatID: data.chatID });
  });

  socket.on("deleteMessage", async (data) => {
    const chat = await Chat.findById(data.chatID);

    const messageId = new ObjectId(data.messageID);

    const index = chat.messages.findIndex((message) =>
      messageId.equals(message._id)
    );
    chat.messages.splice(index, 1);

    await chat.save();

    socket.broadcast.to(`${data.chatID}room`).emit("removeMessage", data);
  });

  socket.on("deleteChat", async (data) => {
    const chat = await Chat.findByIdAndDelete(data.chatID);

    for (let member of chat.members) {
      const user = await User.findById(member);
      user.chats = user.chats.filter((chat) => chat.id != data.chatID);
      await user.save();

      const socketIDSet = findClientSet(member);
      for (let socketID of socketIDSet)
        io.to(socketID).emit("removeChat", { chatID: data.chatID });
    }
  });
});
