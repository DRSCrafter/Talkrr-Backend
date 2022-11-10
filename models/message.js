const Joi = require("joi");
const moment = require("moment/moment");
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  autoCreate: false,
  autoIndex: false,
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

const Message = mongoose.model("Message", messageSchema);

function validateMessage(message) {
  const schema = Joi.object({
    sender: Joi.string().length(24).required(),
    content: Joi.string().min(1).max(255).required(),
  });

  return schema.validate(message);
}

module.exports.Message = Message;
module.exports.validateMessage = validateMessage;
module.exports.messageSchema = messageSchema;
