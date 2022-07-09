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
        ref: 'User'
    },
    conversations: {
        type: [mongoose.Types.ObjectId],
        ref: 'Chat'
    }
})

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(70).required(),
        email: Joi.string().min(5).max(255).required().email(),
        phoneNumber: Joi.number().min(7).max(15),
        bio: Joi.string().min(3).max(100),
        // contacts: Joi.objectId().required()
    })

    return schema.validate(user);
}

export default {User, validateUser};