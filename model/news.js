
const mongoose = require('mongoose')
const slugify = require('slugify')

const newsSchema = new mongoose.Schema({
    title:{
        type:String,
        unique:true
    },
    description:{
        type:String,
    },
    image:{
        type:Buffer
    },
    slug:{
        type:String,
        unique:true
    },
    createdAt:{
        type : Date,
        default : Date.now
    }
    
})

newsSchema.pre('validate' , function(next){
    if(this.title)
    {
        this.slug = slugify(this.title , {lower:true , strict:true})
    }
    next()
})

module.exports = mongoose.model('News' , newsSchema)