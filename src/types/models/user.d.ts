import {Document, Model, Types} from 'mongoose';

export type ChatReference = { id: Types.ObjectId | string };

export default interface User {
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    bio: string,
    profileImage?: any,
    contacts: Types.ObjectId[],
    chats: ChatReference[],
    pins: Types.ObjectId[]
}

export interface UserDocument extends User, Document {
}

export interface UserModel extends Model<UserDocument> {
    buildUser(args: User): UserDocument;
}