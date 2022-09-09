const express = require('express');
const {User} = require('../models/user.js');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const Joi = require("joi");
const config = require('config');

const router = express.Router();

router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email});
    if (!user)
        return res.status(400).send("Invalid credentials!");

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if (!isValidPassword)
        return res.status(400).send("Invalid credentials!");

    const token = jwt.sign({_id: user._id}, config.get('jwtPrivateKey'));
    res.send(token);
});

function validate(req) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(100).required(),
    })

    return schema.validate(req);
}

module.exports = router;
