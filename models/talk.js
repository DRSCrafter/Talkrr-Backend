const Joi = require("joi");
const mongoose = require("mongoose");
const { messageSchema } = require("../models/message");

const talkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // minlength: 3,
    maxlength: 70,
  },
  about: {
    type: String,
    required: true,
    // minlength: 3,
    maxlength: 100,
    default: "This is a talk from Talkrr",
  },
  members: {
    type: [String],
    default: [],
  },
  talkImage: String,
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

const Talk = mongoose.model("Talk", talkSchema);

function validateTalk(talk) {
  const schema = Joi.object({
    name: Joi.string().max(50).required(),
    about: Joi.string().max(100),
    members: Joi.array().items(Joi.string()),
    isPrivate: Joi.boolean(),
  });

  return schema.validate(talk);
}

module.exports.Talk = Talk;
module.exports.validateTalk = validateTalk;
