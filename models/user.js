const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
    type: Number,
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
  talks: {
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

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(70).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(100).required(),
    phoneNumber: Joi.string().min(7).max(15),
    bio: Joi.string().min(3).max(100),
  });

  return schema.validate(user);
}

module.exports.User = User;
module.exports.userSchema = userSchema;
module.exports.validateUser = validateUser;
