const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.talkrr_cloudName,
  api_key: process.env.talkrr_cloudApiKey,
  api_secret: process.env.talkrr_cloudApiSecret,
});

module.exports = cloudinary;
