const Joi = require('joi');
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        _id: false,
        type: {
            id: String,
            name: String
        },
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

const Message = mongoose.model('Message', messageSchema);

function validateMessage(message) {
    const schema = Joi.object({
        sender: {
            id: Joi.string().length(24).required(),
            name: Joi.string().min(3).max(50).required()
        },
        content: Joi.string().min(1).max(255).required(),
    })

    return schema.validate(message);
}

module.exports.Message = Message;
module.exports.validateMessage = validateMessage;
module.exports.messageSchema = messageSchema;