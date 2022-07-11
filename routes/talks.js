const {Talk, validateTalk} = require('../models/talk');
const {User} = require('../models/user');
const {validateMessage, Message} = require("../models/message");
const express = require('express');
const {ObjectId} = require('mongodb');

const router = express.Router();

router.post('/', async (req, res) => {
    const {error} = validateTalk(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);

    let talk = new Talk({
        name: req.body.name,
        about: req.body.about,
        members: []
    });
    const Members = [];

    for (const member of req.body.members) {
        const user = await User.findById(member);

        Members.push({
            id: member, // if we take the id directly from user, we have to convert it to string which has a performance cost
            name: user.name
        });

        user.talks.push({
            id: talk._id,
            name: talk.name
        })

        await user.save();
    }

    talk.members = Members;
    await talk.save();

    res.send(talk);
});

router.post('/:id/members/', async (req, res) => {
    const talk = await Talk.findById(req.params.id);
    if (!talk)
        return res.status(404).send("Talk not found!");

    const user = await User.findById(req.body.id);
    if (!user)
        return res.status(404).send("User not found!");

    const index = talk.members.findIndex(member => member.id === req.body.id);
    if (index !== -1)
        return res.status(400).send("User already registered!");

    user.talks.push({
        id: req.params.id,
        name: talk.name
    })
    await user.save();

    talk.members.push({
        id: req.body.id,
        name: user.name
    })
    await talk.save();

    res.send("Successful!");
});

router.delete('/:id/members/', async (req, res) => {
    const talk = await Talk.findById(req.params.id);
    if (!talk)
        return res.status(404).send("Talk not found!");

    const user = await User.findById(req.body.id);
    if (!user)
        return res.status(404).send("User not found!");

    let index = talk.members.findIndex(member => member.id === req.body.id);
    if (index === -1)
        return res.status(400).send("User is not in the talk!");

    index = user.talks.findIndex(talk => talk.id === req.params.id);
    user.talks.splice(index, 1);
    await user.save();

    index = talk.members.findIndex(member => member.id === req.body.id);
    talk.members.splice(index, 1);
    await talk.save();

    res.send("Successful!");
});

router.post('/:id/message', async (req, res) => {
    const talk = await Talk.findById(req.params.id);
    if (!talk)
        return res.status(404).send("Talk not found!");

    const {error} = validateMessage(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);

    const message = new Message({
        sender: req.body.sender,
        content: req.body.content
    });
    talk.messages.push(message);
    await talk.save();

    res.send(message);
});

router.put('/:id/message', async (req, res) => {
    const talk = await Talk.findById(req.params.id);
    if (!talk)
        return res.status(400).send("Talk not found!");

    const messageId = new ObjectId(req.body.id);
    const index = talk.messages.findIndex(message => messageId.equals(message._id));
    if (index === -1)
        return res.status(400).send("Message does not exist!");

    talk.messages[index].content = req.body.content;
    await talk.save();
    res.send(req.body.content);
});

router.delete('/:id/message', async (req, res) => {
    const talk = await Talk.findById(req.params.id);
    if (!talk)
        return res.status(400).send("Talk not found!");

    const messageId = new ObjectId(req.body.id);

    const index = talk.messages.findIndex(message => messageId.equals(message._id));
    talk.messages.splice(index, 1);

    await talk.save();
    res.send("Successful!");
});

router.get('/:id', async (req, res) => {
    const talk = Talk.findById(req.params.id);
    if (!talk)
        return res.status(400).send("Talk not found!");

    res.send(talk);
});

module.exports = router;