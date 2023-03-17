import mongoose, {Schema} from "mongoose";
import Joi from "joi";
import User, {UserDocument, UserModel} from "../types/models/user";

export const UserSchema: Schema<UserDocument> = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 70,
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100,
    },
    phoneNumber: {
        type: String,
        minlength: 7,
        maxlength: 15,
    },
    bio: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
        default: "This is a test from Talkrr",
    },
    profileImage: String,
    contacts: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
        default: [],
    },
    chats: {
        type: [
            {
                _id: false,
                id: String,
            },
        ],
        required: true,
        default: [],
    },
    pins: [mongoose.Schema.Types.ObjectId],
});

UserSchema.statics.buildUser = (args: User) => new User(args);

export const User = mongoose.model<UserDocument, UserModel>("User", UserSchema);

export function validateUser(user: User) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(70).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(100).required(),
        phoneNumber: Joi.string().min(7).max(15),
        bio: Joi.string().min(3).max(100),
    });

    return schema.validate(user);
}