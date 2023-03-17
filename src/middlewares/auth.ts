import jwt from "jsonwebtoken";
import {RequestHandler} from "express";

const mw: RequestHandler = (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).send("Access denied. No token provided.");

    try {
        req.body.user = jwt.verify(token, process.env.talkrr_jwtPrivateKey!);
        next();
    } catch (ex) {
        res.status(400).send("Invalid token.");
    }
}

export default mw;