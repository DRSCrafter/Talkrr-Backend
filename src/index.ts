import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from 'cors';

import "./startup/logging";
import routes from "./startup/routes";
import prod from "./startup/prod";
import socket from "./startup/socket";

dotenv.config();

if (!process.env.talkrr_jwtPrivateKey) {
    console.error("Private Key not defined!");
    process.exit(1);
}

const app = express();
app.use(express.json());
app.use(cors({exposedHeaders: "x-auth-token"}));

const port = process.env.PORT || 3001;
const server = app.listen(port, () => console.log(`Listening on Port ${port}...`));

routes(app);
prod(app);
socket(server);

const db = process.env.talkrr_db!;
mongoose
    .set('strictQuery', true)
    .connect(db)
    .then(() => console.log("Connected to MongoDB..."))
    .catch(() => console.log("Connection failed!"));
