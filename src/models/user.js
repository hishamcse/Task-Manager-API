const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require("./task.js");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,                  // all will be converted to lowercase letter
        validate(value) {
            if (!validator.isEmail(value)) throw new Error('Email format is not correct');
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) throw new Error('Age must be a positive number');
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(value) {
            if (validator.contains(value.toLowerCase(), 'password')) throw new Error('Password contains password');
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

// virtual relationship between user and task. so we can find the tasks created by appropriate user
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// instance method for giving the logged in user only required info. toJSON works like java toString() method
// by default, whenever user info is called. only the toJSON data executed
userSchema.methods.toJSON = function () {
    const user = this
    const userObj = user.toObject()

    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar

    return userObj
}

// instance method for generating authentication token
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = await jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: '7 days'})

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

// custom function (not instance method) to check whether email and password is correct before logging in user
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});

    if (!user) {
        throw new Error('Invalid Login info')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Invalid Login info')
    }

    return user;
}

// * middleware to hash password before saving data to database
// * but it will only work when we will create user. but at the time of update function by default bypasses
//   mongoose functionality. so, we have to change update function slightly at patch code
// * can't use arrow function here as 'this' only applicable to normal function
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// middleware to delete all tasks of a user when that user is deleted
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema);

module.exports = User;