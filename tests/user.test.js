const request = require('supertest')
const app = require('../src/app.js')
const User = require('../src/models/user.js')
const {testUserId, testUser, setupDatabase} = require('../tests/fixtures/db.js')

beforeEach(setupDatabase)

// there is also afterEach, beforeAll, afterAll etc methods

test('Signup test', async () => {
    const response = await request(app).post('/users').send({
        'name': 'Syed Hisham',
        'email': 'syed@example.com',
        'password': 'zerotohero'
    }).expect(201)

    // assert that database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // assertions about response
    expect(response.body).toMatchObject({
        user: {
            name: 'Syed Hisham',
            email: 'syed@example.com',
        },
        token: user.tokens[0].token
    })

    // checking plaintext password is not stored
    expect(response.body.user.password).not.toBe('zerotohero')
})

test('Successful Login test', async () => {
    const response = await request(app).post('/users/login').send({
        'email': testUser.email,
        'password': testUser.password
    }).expect(200)

    const user = await User.findById(testUserId)

    expect(response.body.token).toMatch(user.tokens[1].token)
})

test('Failure Login test', async () => {
    await request(app).post('/users/login').send({
        'email': testUser.email,
        'password': 'mihad123!'
    }).expect(400)
})

test('Successful reading profile test', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Failure reading profile test', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Successful Delete Account test', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(testUserId)
    expect(user).toBeNull()
})

test('Failure Delete Account test', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Upload avatar test', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(testUserId)

    // expect({}).toEqual({})               // toBe -> ===  so, we have to use toEqual for objects
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Successful Update user test', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .send({
            name: 'Hisham'
        })
        .expect(200)

    const user = await User.findById(testUserId)
    expect(user.name).toBe('Hisham')
})

test('Failure Update user test', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .send({
            Location: 'Dhaka'
        })
        .expect(400)
})

//
// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated