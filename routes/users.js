const {User, validateUser} = require('../models/user.js');
const express = require('express');
const _ = require('lodash');

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

router.post('/:id', async (req, res) => {
    const user = User.findById(req.params.id);
    if (!user)
        return res.status(400).send("User not found!");

    user.name = req.body.name;
    user.password = req.body.password;
    user.phoneNumber = req.body.phoneNumber;
    user.bio = req.body.bio;

    await user.save();
});

router.post('/contacts/', async (req, res) => {
    const user = await User.findById(req.body.id);
    if (!user)
        return res.status(404).send("User not found!");

    const me = await User.findById(req.body.me);
    me.contacts.push({
        id: req.body.id,
        name: user.name
    });

    await me.save();
    res.send(req.body.id);
});

router.delete('/contacts/', async (req, res) => {
    const user = await User.findById(req.body.id);
    if (!user)
        return res.status(404).send("User not found!");

    const me = await User.findById(req.body.me);
    const index = me.contacts.findIndex(contact => contact.id === req.body.id);
    me.contacts.splice(index, 1);

    await me.save();
    res.send(req.body.id);
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-password -contacts -talks -__v');
    res.send(user);
});

router.get('/:id/contacts', async (req, res) => {
    const user = await User.findById(req.params.id).select('-_id contacts');
    res.send(user);
});

module.exports = router;
