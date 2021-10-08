const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('Successfully Connected')
    }).catch(err => {
    console.log(err)
})