const express = require('express')
require('./db/mongoose.js')
const userRouter = require('./routers/userRouter.js')
const taskRouter = require('./routers/taskRouter.js')

const app = express()
const port = process.env.PORT

app.use(express.json())             // so, auto parse json data to an object
app.use(userRouter)                 // using the router for user
app.use(taskRouter)                 // using the router for task

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})