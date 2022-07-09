const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const user = require('./routes/users');

const app = express();

mongoose.connect('mongodb://localhost/talkrr')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(() => console.log('Connection failed!'));

app.use(express.json())
app.use('/api/users', user);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on Port ${port}...`));
