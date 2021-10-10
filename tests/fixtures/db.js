const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require("../../src/models/user.js");
const Task = require('../../src/models/task.js')

const testUserId = new mongoose.Types.ObjectId()
const testUser = {
    _id: testUserId,
    'name': 'Syed Mihad',
    'email': 'syedMihad@example.com',
    'password': 'zerotohero!',
    tokens: [{
        token: jwt.sign({_id: testUserId}, process.env.JWT_SECRET)
    }]
}

const testUserId2 = new mongoose.Types.ObjectId()
const testUser2 = {
    _id: testUserId2,
    'name': 'Anonymous User',
    'email': 'anonymous@example.com',
    'password': 'heyYou!',
    tokens: [{
        token: jwt.sign({_id: testUserId2}, process.env.JWT_SECRET)
    }]
}

const testTask1 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First Task',
    completed: false,
    owner: testUser._id
}

const testTask2 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second Task',
    completed: true,
    owner: testUser._id
}

const testTask3 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Third Task',
    completed: true,
    owner: testUser2._id
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(testUser).save()
    await new User(testUser2).save()
    await new Task(testTask1).save()
    await new Task(testTask2).save()
    await new Task(testTask3).save()
}

module.exports = {
    testUserId, testUser,
    testUserId2, testUser2,
    testTask1, testTask2, testTask3,
    setupDatabase
}