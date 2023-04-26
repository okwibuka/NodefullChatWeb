
const mongoose = require('mongoose')
const slugify = require('slugify')

const likesSchema = new mongoose.Schema({

liker_first_name : {
type:String,
required:true
},
liker_last_name:{
type:String,
required:true,  
},
liker_image:{
type:String,
},

post_id:{
type:String
},
slug:{
type:String
},
createdAt:{
type:Date,
default:Date.now
}
})

likesSchema.pre('validate' , function(next){
if(this.post_id)
{
this.slug = slugify(this.post_id )
}
next()
})

module.exports = mongoose.model('likes' , likesSchema)