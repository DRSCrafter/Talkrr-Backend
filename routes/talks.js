const {Talk, validateTalk} = require('../models/talk');
const {User} = require('../models/user');
const express = require('express');
const _ = require('lodash');

const router = express.Router();

router.post('/', async (req, res) => {
    // const {error} = validateTalk(req.body);
    // if (error)
    //     return res.status(400).send(error.details[0].message);

    let talk = new Talk(_.pick(req.body, ['name', 'about', 'members']));
    await talk.save();

    for (const member of req.body.members) {
        const talker = await User.findById(member);
        const Conversations = [...talker.conversations];

        Conversations.push(talk._id);
        talker.conversations = Conversations;

        await talker.save();
    }

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


module.exports = router;