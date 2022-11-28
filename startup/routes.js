const express = require("express");

const user = require("../routes/users");
const chat = require("../routes/chats");
const auth = require("../routes/auth");

module.exports = function (app) {
  app.use("/uploads", express.static("uploads"));
  app.use("/api/users", user);
  app.use("/api/chats", chat);
  app.use("/api/auth", auth);
};
