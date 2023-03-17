import {Document, Model, Types} from "mongoose";
import Message from "./message";

export type Member = { id: String }

export default interface Chat {
    _id: Types.ObjectId,
    name: string,
    about: string,
    members: string[],
    isPrivate: boolean,
    chatImage?: any,
    messages: Message[]
}

export interface ChatDocument extends Chat, Document {
}

export interface ChatModel extends Model<ChatDocument> {
    buildChat(args: Chat): ChatDocument;
}