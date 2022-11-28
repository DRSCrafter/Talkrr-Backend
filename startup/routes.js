const express = require("express");

const user = require("../routes/users");
const chat = require("../routes/chats");
const auth = require("../routes/auth");
const test = require("../routes/test");

module.exports = function (app) {
  app.use("/uploads", express.static("uploads"));
  app.use("/api/users", user);
  app.use("/api/chats", chat);
  app.use("/api/auth", auth);
  app.use("/api/test", test);
};
