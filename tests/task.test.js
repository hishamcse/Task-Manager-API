const request = require('supertest')
const app = require('../src/app.js')
const Task = require('../src/models/task.js')
const {testUser, testUser2, testTask1, setupDatabase} = require('../tests/fixtures/db.js')

beforeEach(setupDatabase)

test('Create task test', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .send({
            description: 'Test task creation'
        })
        .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Read tasks test', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toBe(2)
})

test('Delete Task Security Test', async () => {
    await request(app)
        .delete(`/tasks/${testTask1._id}`)
        .set('Authorization', `Bearer ${testUser2.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(testTask1._id)
    expect(task).not.toBeNull()
})

//
// Task Test Ideas
//
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should fetch only completed tasks
// Should fetch only incomplete tasks
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks