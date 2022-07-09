const {User, validateUser} = require('../models/user.js');
const express = require('express');
const _ = require('lodash');
const {ObjectId} = require('mongodb');

const router = express.Router();

router.post('/', async (req, res) => {
    const {error} = validateUser(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email});
    if (user)
        return res.status(400).send("User Already registered!");

    user = new User(_.pick(req.body, ['name', 'email', 'password', 'phoneNumber', 'bio']));
    await user.save();

    res.send(user);
});

router.post('/contacts/', async (req, res) => {
    let user = await User.findOne({_id: req.body.id});
    if (!user)
        return res.status(404).send("User not found!");

    const me = await User.findById(req.body.me);
    const Contacts = [...me.contacts];
    Contacts.push(req.body.id);
    me.contacts = Contacts;

    await me.save();
});

router.delete('/contacts/', async (req, res) => {
    const user = await User.findById(req.body.id);
    if (!user)
        return res.status(404).send("User not found!");

    const me = await User.findById(req.body.me);
    const Contacts = [...me.contacts];
    const target = ObjectId(req.body.id);
    const index = Contacts.indexOf(target);
    Contacts.splice(index, 1);
    me.contacts = Contacts;

    await me.save();
    res.send(req.body.id);
})

module.exports = router;
