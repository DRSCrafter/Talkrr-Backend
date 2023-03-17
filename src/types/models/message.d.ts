import {Document, Model, Types} from 'mongoose';

export default interface Message {
    _id: Types.ObjectId,
    sender: string,
    content: string,
    date: string
}

export interface MessageDocument extends Message, Document {
}

export interface MessageModel extends Model<MessageDocument> {
    buildMessage(args: Message): MessageDocument;
}