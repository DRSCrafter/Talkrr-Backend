const {Talk, validateTalk} = require('../models/talk');
const {User} = require('../models/user');
const {validateMessage, Message} = require("../models/message");
const express = require('express');
const {ObjectId} = require('mongodb');

const router = express.Router();

router.post('/', async (req, res) => {
    // const {error} = validateTalk(req.body);
    // if (error)
    //     return res.status(400).send(error.details[0].message);

    let talk = new Talk({
        name: req.body.name,
        about: req.body.about,
        members: []
    });
    const Members = [];

    for (const member of req.body.members) {
        const talker = await User.findById(member);
        const Talks = [...talker.talks];

        Members.push({
            id: member, // if we take the id directly from user, we have to convert it to string which has a performance cost
            name: talker.name
        });

        Talks.push({
            id: talk._id,
            name: talk.name
        })
        talker.talks = Talks;

        await talker.save();
    }

    talk.members = Members;
    await talk.save();

    res.send(talk);
});

router.post('/', async (req, res) => {
    const user = await User.findById(req.body.id);
    const talk = await Talk.findById(req.body.talk);

    const Conversations = [...user.conversations];
    Conversations.push(req.body.talk);
    user.conversations = Conversations;
    await user.save();

    const Members = [...talk.members];
    Members.push(req.body.id);
    talk.members = Members;
    await talk.save();

    res.send("Successful");
});

router.post('/members/', async (req, res) => {
    const talk = await Talk.findById(req.body.talk);
    const user = await User.findById(req.body.id);
    if (!user)
        return res.status(404).send("User not found!");

    const Talks = [...user.talks];
    Talks.push({
        id: req.body.talk,
        name: talk.name
    })
    user.talks = Talks;
    await user.save();

    const Members = [...talk.members];
    Members.push({
        id: req.body.id,
        name: user.name
    })
    talk.members = Members;
    await talk.save();

    res.send("Successful!");
});

router.delete('/members/', async (req, res) => {
    const talk = await Talk.findById(req.body.talk);
    const user = await User.findById(req.body.id);
    if (!user)
        return res.status(404).send("User not found!");

    const Talks = [...user.talks];
    let index = Talks.findIndex(talk => talk.id === req.body.talk);
    Talks.splice(index, 1);
    user.talks = Talks;
    await user.save();

    const Members = [...talk.members];
    index = Members.findIndex(member => member.id === req.body.id);
    Members.splice(index, 1);
    talk.members = Members;
    await talk.save();

    res.send("Successful!");
});

router.post('/:id', async (req, res) => {
    const talk = await Talk.findById(req.params.id);
    if (!talk)
        return res.status(404).send("Talk not found!");

    if (validateMessage(req.body).error)
        return res.status(400).send("Invalid message!");

    const message = new Message({
        sender: req.body.sender,
        content: req.body.content
    });
    talk.messages.push(message);
    await talk.save();

    res.send(message);
});

router.put('/:id', async (req, res) => {
    const talk = await Talk.findById(req.params.id);
    const messageId = new ObjectId(req.body.id);

    const index = talk.messages.findIndex(message => messageId.equals(message._id));
    if (index === -1)
        return res.status(400).send("Message does not exist!");

    talk.messages[index].content = req.body.content;

    await talk.save();
    res.send(req.body.content);
});

router.delete('/:id', async (req, res) => {
    const talk = await Talk.findById(req.params.id);
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