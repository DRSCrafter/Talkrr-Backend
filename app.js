import Express from 'express';
import mongoose from "mongoose";
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const app = Express();

mongoose.connect('mongodb://localhost/talkrr')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(() => console.log('Connection failed!'));

app.use(Express.json())

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on Port ${port}...`));
