
const express = require('express')
const Post = require('../../model/posts')
const multer = require('multer')
const router = new express.Router()
const passpost_config = require('../../config/config')
const News = require('../../model/news')
const User = require('../../model/users')
const {checkAuthenticated} = require('../../config/auth')


// add post

const storage = multer.diskStorage({
    destination : './public/post_images/',
    filename : (req,file,cb)=>{
        cb(null , file.fieldname + '-' +Date.now() + 
        path.extname(file.originalname))
    }
})
const upload = multer({
    storage: storage,
    limits :{
        fileSize : 1000000
    },
    fileFilter: function(req , file , cb)
    {
        
    const fileTypes = /jpeg|jpg|png|gif/
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = fileTypes.test(file.mimetype)

    if(extname && mimetype)
    {
        return cb(null , true)
    }
    else{
        return cb('image only!')
    }
    },
}).single('image')

router.post('/createPost',checkAuthenticated , async(req,res)=>{
    const user = req.user
    const posts = await Post.find().sort({createdAt:'desc'})
    const users = await User.find({_id:{$ne:user.id}})
    const news = await News.findOne().sort({createdAt : 'desc'})

    upload(req,res,(err)=>{
        if(err){
            res.render("index",{
                msg:err,
                user:user,
                posts:posts,
                news:news,
                users:users
            })
        }else{
            if(req.file == undefined)
            {
                res.render("index",{
                    msg: 'No image selected!',
                    user:user,
                    posts:posts,
                    news:news,
                    users:users
                })
            }else{
                const posts = new Post({
                    description : req.body.description,
                    image : req.file.filename,
                    user_id : req.user.id,
                    user_first_name : req.user.first_name,
                    user_last_name : req.user.last_name,
                    user_profile : req.user.image
                    })
                    posts.save()
                    res.redirect('/')
            }
        }
    })
})


module.exports = router