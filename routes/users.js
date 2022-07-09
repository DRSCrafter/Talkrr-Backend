import {User, validateUser} from '../models/user.js'
import Express from "express";
import {lodash} from "lodash/seq.js";

const router = Express.router();

router.post('/', async (req, res) => {
    const {error} = validateUser(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email});
    if (user)
        return res.status(400).send("User Already registered!");

    user = new User(lodash.pick(req.body, ['name', 'email', 'password', 'phoneNumber', 'bio']));
    await user.save();
});

router.post('/contacts', async (req, res) => {
    let user = await User.findOne({_id: req.body.id});
    if (!user)
        return res.status(404).send("User not found!");

    const me = await User.findOne({_id: req.body.me});
    me.contacts.push(req.body.id);

    await me.save();
});

router.delete('/contacts', async (req, res) => {
    let user = await User.findOne({_id: req.body.id});
    if (!user)
        return res.status(404).send("User not found!");

    const me = await User.findOne({_id: req.body.me});
    me.contacts.filter((id) => id !== req.body.id);

    await me.save();
})