const express = require('express');
const Task = require('../models/task');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        const data = await task.save();
        res.status(201).send(data);
    } catch (e) {
        res.status(400).send(e);
    }
})

router.get('/tasks', auth, async (req, res) => {
    try {
        const match = {};
        const sort = {};

        if (req.query.completed) {
            match.completed = (req.query.completed == 'true') ? true : false;
        }

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = (parts[1] == 'desc') ? -1 : 1;
        }

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        if (req.user.tasks.length > 0) return res.send(req.user.tasks);
        res.status(404).send();
    } catch (e) {
        res.status(500).send(e);
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        let data = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!data) return res.status(404).send();
        //await data.populate('owner').execPopulate();
        res.send(data);
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["des", "completed"];
    const isValid = updates.every((update) => allowedUpdates.includes(update));

    if (!isValid) return res.status(400).send();

    try {
        let task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        updates.forEach(e => task[e] = req.body[e]);
        task = await task.save();

        if (!task) return res.status(404).send();
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndRemove({ _id: req.params.id, owner: req.user._id });

        if (!task) return res.status(404).send();
        //await task.remove()
        res.send(task)
    } catch (e) {
        res.status(400).send();
    }
});

module.exports = router;