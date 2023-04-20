
const mongoose = require('mongoose')
const slugify = require('slugify')

const postsSchema = new mongoose.Schema({
    description:
    {
        type:String,
        trim:true
    },
    image:{
        type:Buffer
    },
    user_id:{
        type:String
    },
    user_first_name:{
        type:String
    },
    user_last_name:{
        type:String
    },
    user_profile:{
        type:Buffer
    },
    comment:
        [
            
        ],

    slug:{
    type:String
    },
    
    createdAt:{
        type : Date,
        default : Date.now
    },
   
})


postsSchema.pre('validate' , function(next){
    if(this.user_id)
    {
        this.slug = slugify(this.user_id )
    }
    next()
})

const Post = mongoose.model('Post' , postsSchema)
module.exports = Post