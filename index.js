const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const config = require('config');
const user = require('./routes/users');
const talk = require('./routes/talks');
const auth = require('./routes/auth');
const cors = require('cors');

const app = express();

if (!config.get('jwtPrivateKey')){
    console.error('Private Key not defined!')
    process.exit(1);
}

mongoose.connect('mongodb://localhost/talkrr')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(() => console.log('Connection failed!'));

app.use(express.json());
app.use(cors({exposedHeaders: 'x-auth-token'}));
app.use('/uploads', express.static('uploads'));
app.use('/api/users', user);
app.use('/api/talks', talk);
app.use('/api/auth', auth);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on Port ${port}...`));
