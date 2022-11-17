const Joi = require("joi");
const mongoose = require("mongoose");
const { messageSchema } = require("../models/message");

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 70,
  },
  about: {
    type: String,
    required: true,
    maxlength: 100,
    default: "This is a chat from Talkrr",
  },
  members: {
    type: [String],
    default: [],
  },
  chatImage: String,
  messages: {
    type: [messageSchema],
    required: true,
    default: [],
  },
  isPrivate: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const Chat = mongoose.model("Chat", chatSchema);

function validateChat(chat) {
  const schema = Joi.object({
    name: Joi.string().max(50).required(),
    about: Joi.string().max(100),
    members: Joi.array().items(Joi.string()),
    isPrivate: Joi.boolean(),
  });

  return schema.validate(chat);
}

module.exports.Chat = Chat;
module.exports.validateChat = validateChat;
