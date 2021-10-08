const express = require('express')
const Task = require('../models/task.js')
const auth = require("../middleware/auth.js");
const router = new express.Router()

// route handler for creating task for the user
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task);
    } catch (err) {
        res.status(400).send(err);
    }
})

// route handler for reading all tasks of this user or specific tasks based on query
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10          // means we will get 10 tasks at one page but will skip first 10 tasks. so, second page
// GET /tasks?sortBy=createdAt_asc      or     GET /tasks?sortBy=createdAt_desc
// GET /tasks?sortBy=updatedAt_asc      or     GET /tasks?sortBy=updatedAt_desc
router.get('/tasks', auth, async (req, res) => {
    const populateOptions = {
        path: 'tasks',
        options: {}
    }

    if (req.query.completed) {
        populateOptions.match = {}
        populateOptions.match.completed = req.query.completed === 'true'      // as req.query always returns a string
    }

    if (req.query.sortBy) {
        const arr = req.query.sortBy.split('_')
        populateOptions.options.sort = {}
        populateOptions.options.sort[arr[0]] = arr[1] === 'desc' ? -1 : 1
    }

    // Only add the limit if a value is supplied
    if (req.query.limit) { populateOptions.options.limit = parseInt(req.query.limit, 10) }

    // Only add the skip if a value is provided
    if (req.query.skip) { populateOptions.options.skip = parseInt(req.query.skip, 10) }

    try {
        await req.user.populate([populateOptions])
        res.send(req.user.tasks)

        // alternative way. but it will be manual as 'populate' method by default has some advanced features
        // const tasks = await Task.find({owner: req.user._id})
        // res.send(tasks)
    } catch (err) {
        res.status(500).send(err)
    }
})

// route handler for reading task by id
router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if (!task) {
            res.status(404).send('Task not found')
        }
        res.send(task)
    } catch (err) {
        res.status(500).send(err)
    }
})

// route handler for updating task by id
router.patch('/tasks/:id', auth, async (req, res) => {
    const attemptedUpdates = Object.keys(req.body)
    const allowedUpdates = ["description", "completed"]
    const isValidOperation = attemptedUpdates.every(attemptedUpdate => allowedUpdates.includes(attemptedUpdate))

    if (!isValidOperation) {
        return res.status(400).send('Invalid Updates!!')
    }

    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if (!task) {
            res.status(404).send()
        }

        attemptedUpdates.forEach(update => task[update] = req.body[update])
        await task.save()

        res.send(task)
    } catch (err) {
        res.status(500).send(err)
    }
})

// route handler for deleting task by id
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if (!task) {
            res.status(404).send({error: "can't find task"})
        }
        res.send(task)
    } catch (err) {
        res.status(500).send(err)
    }
})

module.exports = router