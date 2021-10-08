const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'         // relationship between user and task
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)              // modern way of declaration

// const myTask = new Task({
//     description: '      My 3rd mongoose task ',
//     completed: true
// });
//
// myTask.save().then(() => {
//     console.log(myTask);
// }).catch(err => {
//     console.log(err);
// });

module.exports = Task;