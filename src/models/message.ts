import mongoose, {Schema} from "mongoose";
import Joi from "joi";
import moment from "moment/moment";
import Message, {MessageDocument, MessageModel} from "../types/models/message";

export const MessageSchema: Schema<MessageDocument> = new mongoose.Schema({
    sender: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
        default: moment().format("MMM Do, h:mm a"),
    },
});

MessageSchema.statics.buildMessage = (args: Message) => new Message(args);

export const Message = mongoose.model<MessageDocument, MessageModel>("Message", MessageSchema);

export function validateMessage(message: Message) {
    const schema = Joi.object({
        sender: Joi.string().length(24).required(),
        content: Joi.string().min(1).max(255).required(),
    });

    return schema.validate(message);
}