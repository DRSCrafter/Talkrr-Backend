import cloudinary from 'cloudinary';

const cloudinaryEngine = cloudinary.v2;

cloudinaryEngine.config({
    cloud_name: process.env.talkrr_cloudName,
    api_key: process.env.talkrr_cloudApiKey,
    api_secret: process.env.talkrr_cloudApiSecret,
});

export default cloudinaryEngine;