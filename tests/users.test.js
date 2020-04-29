const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOne, userOneID, setUpDataBase } = require('./fixtures/db');



beforeEach(setUpDataBase)

test('should signup a new User', async () => {
    await request(app).post('/users').send({
        name: 'Ahmed',
        email: 'rami@gmail.com',
        password: 'hellomoto123'
    }).expect(201)
})

test('should login a new User', async () => {
    const res = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(res.body.user._id);

    expect(res.body).toMatchObject({
        user: {
            name: user.name,
            email: user.email
        },
        token: user.tokens[1].token
    })
})

test('should not login a nonExistent user', async () => {
    await request(app).post('/users/login').send({
        email: 'helloworld@hihi.com',
        password: userOne.password
    }).expect(400);
})

test('should get user profile when authenticated', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send().expect(200)
})

test('should not get user profile when not authenticated', async () => {
    await request(app)
        .get('/users/me')
        .send().expect(401)
})

test('should delete user profile when authenticated', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send().expect(200)

    const user = await User.findById(userOne._id);

    expect(user).toBeNull();

})

test('should not delete user profile when not authenticated', async () => {
    await request(app)
        .delete('/users/me')
        .send().expect(401)
})

test('should Upload user image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findOne({ _id: userOne._id });

    expect(user.avatar).toEqual(expect.any(Buffer));

})

test('should Update user fields "name"', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'melzi'
        })
        .expect(200)

    const user = await User.findOne({ _id: userOne._id });

    expect(user.name).toBe('melzi')

})

test('should not Update user\'s inexistent fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'melzi'
        })
        .expect(400);
})
