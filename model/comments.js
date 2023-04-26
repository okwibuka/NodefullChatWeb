
const mongoose = require('mongoose')

const commentsSchema = new mongoose.Schema({
comment:{
type:String,
required:true
},
writter_first_name:{
type:String,
required:true
},
writter_last_name:{
type:String,
required:true
},
writter_image:{
type:Buffer,
},

created_at:{
type:Date,
default:Date.now
}

})

module.exports = mongoose.model('comment' , commentsSchema)