const Joi = require('joi');
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    sender: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
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
        content: Joi.string().min(1).max(255).required(),
        sender: Joi.objectId().required()
    })

    return schema.validate(message);
}

export default {Message, validateMessage};