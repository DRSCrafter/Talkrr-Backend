const express = require("express");
const mongoose = require("mongoose");
const config = require("config");

const cors = require("cors");

if (!config.get("jwtPrivateKey")) {
  console.error("Private Key not defined!");
  process.exit(1);
}

const port = process.env.PORT || 3005;

const app = express();
app.use(express.json());
app.use(cors({ exposedHeaders: "x-auth-token" }));

const server = app.listen(port, () =>
  console.log(`Listening on Port ${port}...`)
);

require("./startup/logging");
require("./startup/routes")(app);
require("./startup/prod")(app);
require("./startup/socket")(server);

const db = config.get("db");
mongoose
  .connect(db)
  .then(() => console.log("Connected to MongoDB..."))
  .catch(() => console.log("Connection failed!"));
