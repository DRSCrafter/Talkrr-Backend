import Joi from "joi";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 70
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100
    },
    phoneNumber: {
        type: Number,
        minlength: 7,
        maxlength: 15
    },
    bio: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
        default: "This is a test from Talkrr"
    },
    contacts: {
        type: [mongoose.Types.ObjectId],
        ref: 'User',
        required: true,
        default: []
    },
    conversations: {
        type: [mongoose.Types.ObjectId],
        ref: 'Chat',
        required: true,
        default: []
    }
})

export const User = mongoose.model('User', userSchema);

export function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(70).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(100).required(),
        phoneNumber: Joi.number().min(7).max(15),
        bio: Joi.string().min(3).max(100),
        // contacts: Joi.objectId().required()
    })

    return schema.validate(user);
}

// export default {User, validateUser};