
const mongoose = require('mongoose')
const chatsSchema = new mongoose.Schema({
    sender_id:{
        type:String,
        required:true
    },
    receiver_id:{
        type:String,
        required:true
    },
    sender_first_name:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    sender_last_name:{
        type:String,
        reqired:true
    },
    sender_profile:{
        type:Buffer
    },
    createdAt:{
        type : Date,
        default : Date.now
    }
})

module.exports = mongoose.model('chats' , chatsSchema)