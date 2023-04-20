
const mongoose = require('mongoose')

const messagesSchema = new mongoose.Schema({
    user_id:{
        type:String,
        required:true,
    },
    user_first_name:{
        type:String,
        required:true
    },
    user_last_name:{
        type:String,
        required:true
    },
    user_profile:{
        type:Buffer
    },
    message:{
        type:String,
        required:true,
        trim:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('message' , messagesSchema)