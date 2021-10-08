const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user.js')
const auth = require('../middleware/auth.js')
const {sendWelcomeMail, sendCancellationMail} = require('../emails/account.js')
const router = new express.Router()

// route handler for creating user
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save()
        const token = await user.generateAuthToken()
        await sendWelcomeMail(user.name, user.email)
        res.status(201).send({user, token})
    } catch (err) {
        res.status(400).send(err);
    }
})

// route handler for login user
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({user, token})
    } catch (err) {
        res.status(400).send()
    }
})

// route handler for logging out of one particular session/device only
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(tokenObj => tokenObj.token !== req.token)
        await req.user.save()
        res.send('Successfully logged out')
    } catch (e) {
        res.status(500).send(e)
    }
})

// route handler for logging out of all sessions/devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send('Successfully logged out All')
    } catch (e) {
        res.status(500).send(e)
    }
})

// // route handler for reading all users (will not be possible in real world app)
// router.get('/users' , async (req, res) => {
//     try {
//         const users = await User.find({})
//         res.send(users)
//     } catch (err) {
//         res.status(500).send(err)
//     }
// })

// route handler for individual user for seeing his own profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// // route handler for reading user by id (can't do in real world app because that's privacy issue)
// router.get('/users/:id', async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (!user) {                 // the req can be successful even if we don't find a valid user.
//             res.status(404).send('User not found')
//         }
//         res.status(200).send(user)
//     } catch (err) {
//         res.status(500).send(err)
//     }
// })

// // route handler for updating user info by id (not applicable for real world app)
// router.patch('/users/:id', async (req, res) => {
//     const attemptedUpdates = Object.keys(req.body)
//     const allowedUpdates = ["name", "email", "age", "password"]
//     const isValidOperation = attemptedUpdates.every(attemptedUpdate => allowedUpdates.includes(attemptedUpdate))
//
//     if (!isValidOperation) {
//         return res.status(400).send('Invalid Updates!!')
//     }
//
//     try {
//         // update function will bypass the mongoose middleware to hash password. so, we have to change it
//         // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
//
//         const user = await User.findById(req.params.id);
//         attemptedUpdates.forEach(update => user[update] = req.body[update])
//         await user.save()
//
//         if (!user) {
//             res.status(404).send()
//         }
//         res.send(user)
//     } catch (err) {
//         res.status(500).send(err)
//     }
// })

// route handler for the user for updating his own info
router.patch('/users/me', auth, async (req, res) => {
    const attemptedUpdates = Object.keys(req.body)
    const allowedUpdates = ["name", "email", "age", "password"]
    const isValidOperation = attemptedUpdates.every(attemptedUpdate => allowedUpdates.includes(attemptedUpdate))

    if (!isValidOperation) {
        return res.status(400).send('Invalid Updates!!')
    }

    try {
        attemptedUpdates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (err) {
        res.status(500).send(err)
    }
})

// // route handler for deleting user by id (not applicable for real world app)
// router.delete('/users/:id', async (req, res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.params.id)
//         if (!user) {
//             return res.status(404).send({error: "can't find user"})
//         }
//         res.send(user)
//     } catch (err) {
//         res.status(500).send(err)
//     }
// })

// route handler for user for deleting himself
router.delete('/users/me', auth, async (req, res) => {
    try {
        await sendCancellationMail(req.user.name, req.user.email)
        await req.user.remove()
        res.send(req.user)
    } catch (err) {
        res.status(500).send(err)
    }
})

const avatars = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        // alternative (using endsWith method)
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error('Please upload valid image file'))
        }

        callback(undefined, true)
    }
})

// upload avatar: as we have to add file or binary data. so, we have to create new route handler for this url
router.post('/users/me/avatar', auth, avatars.single('avatar'), async (req, res) => {
    req.user.avatar = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    await req.user.save()
    res.send()
}, (err, req, res, next) => {
    res.status(400).send({error: err.message})
})

// delete avatar: as we have to delete file or binary data. so, we have to create new route handler for this url
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

// show avatar: as we have to show file or binary data. so, we have to create new route handler for this url
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            res.status(404).send()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (err) {
        res.status(404).send()
    }
})

module.exports = router;