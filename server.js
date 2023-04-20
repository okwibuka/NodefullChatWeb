
require('dotenv').config()
require('./database/db')
const express = require('express')
const flash = require('express-flash')
const session = require('express-session')  
const passport = require('passport')
const methodOverride = require('method-override')
const pagesRouter = require('./routes/pagesRoute/pages')
const usersRouter = require('./routes/usersRoute/users')
const postsRouter = require('./routes/postsRoute/posts')
const adminRouter = require('./routes/adminRoute/pages')
const Commment = require('./model/comments')
const Post = require('./model/posts')
const Like = require('./model/like')
const News = require('./model/news')
const User = require('./model/users')
const passport_config = require('./config/config')

const app = express()

const port = process.env.PORT || 3000

app.set('view engine','ejs')
app.use(express.static('./public'))

app.use(express.urlencoded({extended : false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use(pagesRouter)
app.use(usersRouter)
app.use(postsRouter)
app.use(adminRouter)

//middleware for checking if user is not authenticated

 function checkNotAuthenticated(req,res,next)
{
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
     next()
}

//middleware for checking if user is authenticated before logging in

 function checkAuthenticated(req,res,next)
{
    if(req.isAuthenticated()){
        return next()
    }else{
        res.redirect('/login')
    }
}




    
app.get('/' , checkAuthenticated , async(req,res) =>{
  
    try{
        const user = req.user
        const users = await User.find({
            _id:{$ne:user.id}
        })
        const news = await News.findOne().sort({createdAt : 'desc'})
        const posts = await Post.find().sort({createdAt : 'desc'})
        res.render('index' , {posts : posts , news : news , user : user , users:users })

    }catch (e){
       console.log(e)
    }
    
})



//user login

app.post('/login' ,  checkNotAuthenticated,  passport.authenticate('local' ,{
    
    successRedirect :'/',
    failureRedirect: '/login',
    failureFlash : true
}))

//user logout

app.delete('/logout' , (req,res ,next) =>{
    req.logOut((err)=>{
        if(err){
            return next(err)
        }
        res.redirect('/login')
    })
})


app.listen(port , ()=>
{
console.log(`server is on port ${port}`)
})