import {RequestHandler} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {User} from "../models/user";
import {validate} from "../routes/auth";

export const signup: RequestHandler = async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email});
    if (!user) return res.status(400).send("Invalid credentials!");

    const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
    );
    if (!isValidPassword) return res.status(400).send("Invalid credentials!");

    const token = jwt.sign({_id: user._id}, process.env.talkrr_jwtPrivateKey!);
    res.send(token);
};