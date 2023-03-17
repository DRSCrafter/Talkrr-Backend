import {RequestHandler} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cloudinary from "../utils/cloudinary";
import {User, validateUser} from "../models/user.js";
import {Chat, validateChat} from "../models/chat.js";
import {UserDocument} from "../types/models/user";
import {ChatDocument} from "../types/models/chat";

export const postUser: RequestHandler = async (req, res) => {
    const {error} = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user: UserDocument | null = await User.findOne({email: req.body.email});
    if (user) return res.status(400).send("User Already registered!");

    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        bio: req.body.bio,
    });
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        user.profileImage = result.url;
        console.log("reached!");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = jwt.sign({_id: user._id}, process.env.talkrr_jwtPrivateKey!);
    res.header("x-auth-token", token).send(user);
};

export const login: RequestHandler = async (req, res) => {
    let user: UserDocument | null = await User.findOne({email: req.body.email});
    if (!user) return res.status(400).send("User not found!");

    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) return res.status(400).send("Password incorrect!");

    const token = jwt.sign({_id: user._id}, process.env.talkrr_jwtPrivateKey!);
    res.header("x-auth-token", token).send(user);
};

export const editUser: RequestHandler = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).send("User not found!");

    user.name = req.body.name;
    user.password = req.body.password;
    user.phoneNumber = req.body.phoneNumber;
    user.bio = req.body.bio;

    await user.save();
};

export const postContact: RequestHandler = async (req, res) => {
    const user: UserDocument | null = await User.findById(req.body.id);
    if (!user) return res.status(404).send("User not found!");

    const me: UserDocument | null = await User.findById(req.params.id);
    if (!me) return res.status(404).send("Contact not found!");

    me.contacts.push(req.body.id);

    await me.save();
    res.send(req.body.id);
};

export const postPin: RequestHandler = async (req, res) => {
    const user: UserDocument | null = await User.findById(req.params.id);
    if (!user) return res.status(400).send("User not found!");

    const chat: ChatDocument | null = await Chat.findById(req.body.id);
    if (!chat) return res.status(400).send("Chat not found!");

    user.pins.push(req.body.id);
    await user.save();
};

export const removePin: RequestHandler = async (req, res) => {
    const user: UserDocument | null = await User.findById(req.params.id);
    if (!user) return res.status(400).send("User not found!");

    const chat: ChatDocument | null = await Chat.findById(req.body.id);
    if (!chat) return res.status(400).send("Chat not found!");

    user.pins = user.pins.filter((pin) => pin != req.body.id);
    await user.save();
};

export const removeContact: RequestHandler = async (req, res) => {
    const user: UserDocument | null = await User.findById(req.body.id);
    if (!user) return res.status(404).send("User not found!");

    const me: UserDocument | null = await User.findById(req.params.id);
    if (!me) return res.status(404).send("Contact not found!");

    me.contacts = me.contacts.filter((contact) => contact != req.body.id);

    await me.save();
    res.send(req.body.id);
};

export const getContacts: RequestHandler = async (req, res) => {
    const user: UserDocument | null = await User.findById(req.params.id);
    if (!user) return res.status(400).send("User not found!");

    const contacts = [];

    for (let contact of user.contacts) {
        const user = await User.findById(contact).select("_id name profileImage");
        contacts.push(user);
    }

    return res.send(contacts);
};

export const getUser: RequestHandler = async (req, res) => {
    const user: UserDocument | null = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(400).send("User not found!");

    res.send(user);
};

export const getContact: RequestHandler = async (req, res) => {
    const user: UserDocument | null = await User.findById(req.params.id).select("-password -contacts -chats");
    if (!user) return res.status(400).send("User not found!");

    res.send(user);
};

export const getStrictList: RequestHandler = async (req, res) => {
    const users = await User.find().select("_id name profileImage");

    res.send(users);
};

export const getStrictOne: RequestHandler = async (req, res) => {
    const user = await User.findById(req.params.id).select("name email phoneNumber bio profileImage");
    if (!user) return res.status(400).send("User not found!");

    res.send(user);
};