const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');

const { userOne, userOneID, setUpDataBase, taskTwoID } = require('./fixtures/db');

beforeEach(setUpDataBase);

test('should create a new task', async () => {
    const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ des: 'making a new task' })
        .expect(201)

    const task = await Task.findById(res.body._id);

    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
})

test('should get user\'s tasks', async () => {
    const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res.body.length).toEqual(2);
})

test('should get user\'s tasks', async () => {
    const res = await request(app)
        .get(`/tasks`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res.body.length).toEqual(2);
})

test('should not delete other user\'s tasks', async () => {
    const res = await request(app)
        .delete(`/tasks/${taskTwoID.toHexString()}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(taskTwoID);
    expect(task).not.toBeNull();
})