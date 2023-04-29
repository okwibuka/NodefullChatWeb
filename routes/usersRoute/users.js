
const express = require('express')
const router = new express.Router()
const multer = require('multer')
path = require('path')
const User = require('../../model/users')
const Post = require('../../model/posts')
const bcrypt = require('bcryptjs')
const { error } = require('console')
require('../../config/config')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { sendWelcomeMessage , sendDeleteMessage} = require('../../config/emails')
const {checkAuthenticated , checkNotAuthenticated} = require('../../config/auth')

//user registration

router.post('/signup' ,checkNotAuthenticated, async(req,res) =>{

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
        const payloads = {
            first_name,
            last_name,
            email,
            password,
            birth
        }

        const token = jwt.sign(payloads , process.env.JWT_SECRET , {expiresIn : '2d'} )
        res.render('email_verification_message')

        const transporter = nodemailer.createTransport({
            service :'gmail',
            auth : {
                user : 'okwibuka11@gmail.com',
                pass : process.env.NodeMailPass
            }
        })

        const msg = {
            from :{
            name : 'chattWeb',
            address : 'okwibuka11@gmail.com',
            },
            to : email,
            subject : 'account verification link',
            html : `
            <p>this account verification link will be expired in two days:
            <a 
            href="http://localhost:3000/email_verification/${token}">
            http://localhost:3000/email_verification/${token}
            </a>
            `
        }

        transporter.sendMail(msg , (err)=>{
            if(err)
            {
                console.log(err)
            }
            console.log('email sent')
        })
     }
   })
    }

})

//email verification

router.get('/email_verification/:token',checkNotAuthenticated, async(req,res)=>{
    const token = req.params.token
    try{
        jwt.verify(token , process.env.JWT_SECRET , (err)=>{
            if(err){
                console.log(err)
            }
            res.render('email_verification')
        })
    }catch(e)
    {
        console.log(e)
    }
})

router.post('/email_verification/:token',checkNotAuthenticated, async(req,res)=>{
    const token = req.params.token
    try{
        if(token)
        {
            jwt.verify(token , process.env.JWT_SECRET , (err,decodedToken)=>{
                if(err){
                    console.log(err)
                }
        const {first_name,last_name,email,password,birth} = decodedToken
        newUser = new User({
            first_name,
            last_name,
            email,
            password,
            birth,
        })
        bcrypt.hash(newUser.password , 10 , (err,hash)=>{
            if(err){
                console.log(err)
            }
            newUser.password = hash
            newUser.save().then(user=>{
                sendWelcomeMessage(newUser.email , newUser.last_name)
                res.redirect('/login')
            }).catch(e => console.log(e))
        })

            })
        }else{
            console.log('something went wrong')
        }
    }catch(e){
        console.log(e)
    }
})

//email verification message

router.get('/email_verification_message' , async(req,res)=>{
    res.render('email_verification_message')
})

//user delete account

router.post('/delete_Account',checkAuthenticated , async(req,res)=>{
    const user = req.user
    const email = req.user.email
    try
    {
        const payload = {
           id: user.id,
           email : user.email
        }
        const token = jwt.sign(payload , process.env.JWT_SECRET , {expiresIn : '15m'})
        res.render('account_deletion_message')

        const transporter = nodemailer.createTransport({
            service :'gmail',
            auth : {
                user : 'okwibuka11@gmail.com',
                pass : process.env.NodeMailPass
            }
        })

        const msg = {
            from :{
            name : 'chattWeb',
            address : 'okwibuka11@gmail.com',
            },
            to : email,
            subject : 'account deletion link',
            html : `
            <p>this account deletion link will be expired in 15 minutes:
            <a 
            href="http://localhost:3000/account_deletion/${token}">
            http://localhost:3000/account_deletion/${token}
            </a>
            `
        }

        transporter.sendMail(msg , (err)=>{
            if(err)
            {
                console.log(err)
            }
            console.log('email sent')
        })
        
    }catch(e)
    {
        console.log(e)
    }

})

//account deletion message

router.get('/account_deletion_message' , async(req,res)=>{
    res.render('account_deletion_message')
})

router.get('/account_deletion/:token' , async(req,res)=>{
    const token = req.params.token
    try{
        jwt.verify(token , process.env.JWT_SECRET , (err)=>{
            if(err)
            {
                console.log(err)
            }
            res.render('account_deletion' , {token:token})
        })
    }catch(e)
    {
        console.log(e)
    }
})

router.delete('/account_deletion/:token', async(req,res)=>{
    const token = req.params.token
    try{
        jwt.verify(token , process.env.JWT_SECRET , (err)=>{
            if(err)
            {
                console.log(err)
            }
         req.user.remove().then((user)=>{
            if(user)
            {
                sendDeleteMessage(req.user.email , req.user.last_name)
                res.redirect('/login')  
            }
            else
            {
                console.log('user not found')
            }
         }).catch(e => console.log(e))
         
        })
    }catch(e)
    {
        console.log(e)
    }
})

//add user profile

router.get('/add_profile',checkAuthenticated , async(req,res)=>{
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

router.post('/add_Profile',checkAuthenticated , (req,res)=>{
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


//delete user profile

router.delete('/user/delete_profile/:slug',checkAuthenticated , async(req,res)=>{
    const slug = req.params.slug
    const user = req.user
    user.image = undefined
    await user.save()
    res.redirect(`/edit_profile/${slug}`)
    
})

//change password

router.post('/user/change_password',checkAuthenticated , async(req,res)=>{
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

//forget password

router.get('/forget-password',checkNotAuthenticated, (req,res)=>{
    res.render('forget-password')
})

router.post('/forget-password', async(req,res)=>{
    const {email} = req.body
    const errors = []
    User.findOne({email:email}).then(user =>{
        if(!user)
        {
            errors.push({msg :'email not found!'})
            res.render('forget-password',{
                errors
            })
        }else
        {
            const secret = process.env.JWT_SECRET + user.password
            const payload = {
                email : user.email,
                id : user.id
            }
            const token  = jwt.sign(payload , secret , {expiresIn : '15m'})
            res.render('password_reset_message')

            const transport = nodemailer.createTransport({
                service : 'gmail',
                auth : {
                    user : 'okwibuka11@gmail.com',
                    pass : process.env.NodeMailPass
                }
            })
            
            const msg = {
                from :{
                name : 'chattWeb',
                address : 'okwibuka11@gmail.com',
                },
                to : email,
                subject : 'reseting password',
                html : `
                <p>this reset password link will be expired in 15 minutes</p>
                <h3>click here to update: 
                <a 
                href="http://localhost:3000/reset-password/${user.id}/${token}">
                http://localhost:3000/reset-password/${user.id}/${token}
                </a>
                </h3> `
            }
            
            transport.sendMail(msg , (err)=>{
                if(err)
                {
                    console.log(err)
                }else{
                    console.log('email sent')
                }
            })
            
         }
    })
})

//password reset message

router.get('/password_reset_message' , async(req,res)=>{
    res.render('password_reset_message')
})

router.get('/reset-password/:id/:token',checkNotAuthenticated, async(req,res)=>{
    const {id , token} = req.params
    const user = await User.findById(id)
    const errors = []

    if(id !== user.id)
        {
        errors.push({msg : 'invalid id...'})
        res.render('forget_password' , {
            errors
        })
        }

        const secret = process.env.JWT_SECRET + user.password

        try{
            const payload = jwt.verify(token , secret , (err,next)=>{
                if(err) throw err
                res.render('reset-password')
            })
        }catch(e){
            console.log(e)
        }
})
router.post('/reset-password/:id/:token',checkNotAuthenticated, async(req,res)=>{
    const {id , token} = req.params
    const user = await User.findById(id)
    const errors = []

    const {password , confirm_password} = req.body
        if(!password || !confirm_password)
        {
            errors.push({msg : 'all fields are required'})
        }
        if(password.length < 6)
        {
            errors.push({msg : 'password length should be greater than six chars'})
        }
        if(password != confirm_password)
        {
            errors.push({msg : 'password not match'})
        }
        if(id !== user.id)
        {
            errors.push({msg : 'invalid id..'})
        }

        if(errors.length > 0)
        {
            res.render('reset-password',{
                errors
            })
        }else
        {
            const secret = process.env.JWT_SECRET + user.password
            try{
            const payload = jwt.verify(token , secret , (err,next)=>{
                if(err) throw err
            bcrypt.hash(req.body.password , 10 , (error,hash)=>{
                if(error) throw error
                req.body.password = hash
                user.password = req.body.password
                user.save()
                res.redirect('/login')
                           
                })
                        
                })
            }catch(e){
                console.log(e)
            }
        }
})

module.exports = router