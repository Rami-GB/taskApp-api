const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userOneID = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneID,
    name: 'hamid',
    email: 'hamid@gmail.com',
    password: 'khladarwaldih',
    tokens: [
        {
            token: jwt.sign({ _id: userOneID },
                process.env.JWT_SECRET)
        }
    ]
}

const userTwoID = new mongoose.Types.ObjectId();
const userTwo = {
    _id: userTwoID,
    name: 'goodel',
    email: 'goodel@gmail.com',
    password: 'khladarwaldih',
    tokens: [
        {
            token: jwt.sign({ _id: userOneID },
                process.env.JWT_SECRET)
        }
    ]
}

const taskOne = {
    des: 'first task',
    completed: false,
    owner: userOneID
}

const taskTwoID = new mongoose.Types.ObjectId();
const taskTwo = {
    _id: taskTwoID,
    des: 'second task',
    completed: false,
    owner: userTwoID
}

const taskThree = {
    des: 'first task',
    completed: true,
    owner: userOneID
}

const setUpDataBase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
}

module.exports = {
    userOne,
    userOneID,
    taskTwoID,
    setUpDataBase:setUpDataBase
}