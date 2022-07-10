const {Talk, validateTalk} = require('../models/talk');
const {User} = require('../models/user');
const express = require('express');

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


module.exports = router;