
const mongoose = require("mongoose")
const validator = require('validator')
const slugify = require('slugify')

const userSchema = new mongoose.Schema({

    first_name:{
        type:String,
        trim:true,
        required:true
    },
    last_name:{
        type:String,
        trim:true,
        required:true
    },
    email: {
        type:String,
        lowercase:true,
        trim:true,
        unique : true,
        required:true,
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new error('email is invalid')
            }
        }
    },
    password: {
        type : String,
        trim:true,
      
    },
    image: {
        type:Buffer,
    },
    slug: {
        type:String,
        required:true
    },

    birth:{
        type: String,
        required:true
    },
    role:{
        type:String
    },
    createdAt:{
        type:Date,
        default: Date.now
    }

})

userSchema.pre('validate' , function(next){
    if(this.last_name)
    {
        this.slug = slugify(this.last_name , {lower:true , strict:true})
    }
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
