const Joi = require('joi');
const mongoose = require('mongoose');
const {messageSchema} = require('../models/talk');

const talkSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 70
    },
    about: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
        default: "This is a talk from Talkrr"
    },
    members: {
        type: [{
            id: String,
            name: String
        }],
        default: []
    },
    messages: {
        type: [messageSchema],
        required: true,
        default: []
    }
});

const Talk = mongoose.model('Talk', talkSchema);

function validateTalk(talk) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        about: Joi.string().min(3).max(100),
        members: Joi.array().items(Joi.string())
    })

    return schema.validate(talk);
}

module.exports.Talk = Talk;
module.exports.validateTalk = validateTalk;