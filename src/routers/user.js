const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const { auth } = require('../middleware/auth');


const router = express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        const data = await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user: data, token });
    } catch (e) {
        res.status(400).send(e);
    }
})

router.post('/users/login', async (req, res) => {
    try {
        let user = await User.findByCredentials(req.body.email, req.body.password);
        let token = await user.generateAuthToken();
        //console.log(token)
        res.send({ user, token: token });
    } catch (e) {
        res.status(400).send();
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        const user = req.user;

        user.tokens = user.tokens.filter((token) => token.token !== req.token)
        await user.save();

        res.send();
    } catch (error) {
        res.status(500).send();
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        const user = req.user;

        user.tokens = [];
        await user.save();

        res.send();
    } catch (error) {
        res.status(500).send();
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})


router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "password", "age", "email"];
    const isValid = updates.every((update) => allowedUpdates.includes(update));

    if (!isValid) return res.status(400).send();

    try {
        //const user = await User.findById(req.params.id);
        const user = req.user;

        updates.forEach((update) => user[update] = req.body[update]);

        await user.save();
        res.send(user);
    } catch (e) {
        res.status(500).send();
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        const user = req.user;
        //console.log(user);
        await user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(400).send();
    }
});


//Playing with file Uploads!!
const upload = multer({
    limits: {
        fileSize: 1024 * 1024
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('file must be a photo format'))
        }

        cb(undefined, true);
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = await sharp(req.file.buffer).resize(250, 250).jpeg().toBuffer();
    await req.user.save();

    res.send();
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();

    res.send();
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message })
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const { avatar } = await User.findOne({ _id: req.params.id }, { avatar: 1, _id: 0 });

        res.set('Content-Type', 'image/jpeg');
        if (!avatar) throw Error({error: 'not found'});

        res.send(avatar);
    } catch (error) {
        res.status(400).send();
    }
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message })
})

module.exports = router;