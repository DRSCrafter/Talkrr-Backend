import express, {Application} from "express";
import user from "../routes/users";
import chat from "../routes/chats";
import auth from "../routes/auth";
import test from "../routes/test";

export default function (app: Application) {
    app.use("/uploads", express.static("uploads"));
    app.use("/api/v1/users", user);
    app.use("/api/v1/chats", chat);
    app.use("/api/v1/auth", auth);
    app.use("/api/v1/test", test);
};
