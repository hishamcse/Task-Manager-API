const express = require('express')
require('./db/mongoose.js')
const userRouter = require('./routers/userRouter.js')
const taskRouter = require('./routers/taskRouter.js')

const app = express()

app.use(express.json())             // so, auto parse json data to an object
app.use(userRouter)                 // using the router for user
app.use(taskRouter)                 // using the router for task

module.exports = app