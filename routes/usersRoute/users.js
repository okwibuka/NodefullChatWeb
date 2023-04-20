
const express = require('express')
const router = new express.Router()
const multer = require('multer')
path = require('path')
const User = require('../../model/users')
const bcrypt = require('bcryptjs')
const { error } = require('console')
require('../../config/config')


//user registration

router.post('/signup' , async(req,res) =>{

    const {first_name,last_name,email,password,confirm_password,birth} = req.body
    const errors = []
    if(!first_name || !last_name || !email || !password || !confirm_password || !birth)
    {
        errors.push({msg:'all fields must be filled'})
    }
    if(password != confirm_password)
    {
        errors.push({msg:"password not match"})
    }
    if(password.length < 6)
    {
        errors.push({msg:'pasword should be at least 6 characters'})
    }

    if(errors.length > 0)
    {
        res.render('register', {
            errors,
            first_name,
            last_name,
            email,
            password,
            confirm_password,
            birth
        })
    }
    else{
   User.findOne({email:email}).then(user =>{

    if(user)
    {
        errors.push({msg: 'email already exist'})
        res.render('register' , {
            errors,
            first_name,
            last_name,
            email,
            password,
            confirm_password,
            birth
        })
    }else{
        newUser = new User({
            first_name : req.body.first_name,
            last_name : req.body.last_name,
            email : req.body.email,
            password : req.body.password,
            birth : req.body.birth
        })
        bcrypt.hash(newUser.password , 10 , (err,hash)=>{
            if(err) throw new err
            newUser.password = hash
            newUser.save().then(user=>{
                res.redirect('/login')
            }).catch(e => console.log(e))
        })
    }
   })
    }

})

//add user profile

router.get('/add_profile', async(req,res)=>{
    const user = req.user
    res.render('add_profile_image',{user:user})
})

const storage = multer.diskStorage({
    destination : './public/profile_images/',
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
}).single('profile')

router.post('/add_Profile', (req,res)=>{
    const user = req.user
    upload(req,res,(err)=>{
        if(err){
            res.render("add_profile_image",{
                msg:err,
                user:user
            })
        }else{
            if(req.file == undefined)
            {
                res.render("add_profile_image",{
                    msg: 'No file selected!',
                    user:user
                })
            }else{
                req.user.image = req.file.filename
                req.user.save()
                res.redirect('/add_profile')
            }
        }
    })
})


//delete user

router.delete('/user/delete_profile/:slug', async(req,res)=>{
    const slug = req.params.slug
    const user = req.user
    user.image = undefined
    await user.save()
    res.redirect(`/edit_profile/${slug}`)
    
})

//change password

router.post('/user/change_password', async(req,res)=>{
    const user = req.user
    const {old_password,new_password,confirm_new_password} = req.body
    const errors = []

    if(!old_password || !new_password  || !confirm_new_password)
    {
        errors.push({msg : 'all fields are required'})
    }
    if(new_password != confirm_new_password)
    {
        errors.push({msg: 'password not match'})
    }
    if(new_password.length < 6)
    {
        errors.push({msg: 'password length shoud be greater than six characters'})
    }
    if(errors.length > 0)
    {
        res.render('change_password', {
            errors,
            user
        })
    }else{
        bcrypt.compare(req.body.old_password , req.user.password , (err,isMatch)=>{

            if(err) throw new err
            if(!isMatch)
            {
                errors.push({msg : 'incorrect old password'})
                res.render('change_password',{
                    errors,
                    user
                })
            }else{
                bcrypt.hash(req.body.new_password, 10 , (err,hash)=>{
                    if(err) return err
                    req.body.new_password = hash
                    req.user.password = req.body.new_password
                    req.user.save()
                    errors.push({msg : 'ok!'})
                    res.render('change_password',{
                    errors,
                    user
                })

                })
            }
        })
    }
    
})

module.exports = router