const express = require("express");
const cors = require("cors");

const user = require("./routes/users");
const chat = require("./routes/chats");
const auth = require("./routes/auth");

module.exports = function (app) {
  app.use(express.json());
  app.use(cors({ exposedHeaders: "x-auth-token" }));
  app.use("/uploads", express.static("uploads"));
  app.use("/api/users", user);
  app.use("/api/chats", chat);
  app.use("/api/auth", auth);
};
