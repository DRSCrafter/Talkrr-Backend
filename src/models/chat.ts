import mongoose, {Schema} from "mongoose";
import Joi from "joi";
import {MessageSchema} from './message';
import Chat, {ChatDocument, ChatModel} from "../types/models/chat";

export const ChatSchema: Schema<ChatDocument> = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 70,
    },
    about: {
        type: String,
        required: true,
        maxlength: 100,
        default: "This is a chat from Talkrr",
    },
    members: {
        type: [String],
        default: [],
    },
    chatImage: String,
    messages: {
        type: [MessageSchema],
        required: true,
        default: [],
    },
    isPrivate: {
        type: Boolean,
        required: true,
        default: false,
    },
});

ChatSchema.statics.buildChat = (args: Chat) => new Chat(args);

export const Chat = mongoose.model<ChatDocument, ChatModel>("Chat", ChatSchema);

export function validateChat(chat: Chat) {
    const schema = Joi.object({
        name: Joi.string().max(50).required(),
        about: Joi.string().max(100),
        members: Joi.array().items(Joi.string()),
        isPrivate: Joi.boolean(),
    });

    return schema.validate(chat);
}
