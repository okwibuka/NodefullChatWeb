
const express = require('express')
const router = new express.Router()
const Post = require('../../model/posts')
const User = require('../../model/users')
const Update = require('../../model/news')
const Group_message = require('../../model/group_chat')
const Comment = require('../../model/comments')
const methodOverride = require('method-override')
const Like = require('../../model/like')
const passport_config = require('../../config/config')
const { Promise } = require('mongoose')
const Message = require('../../model/mesages')
const { use } = require('passport/lib')

//middleware for checking if user is authenticated before logging in

function checkAuthenticated(req,res,next)
{
    if(req.isAuthenticated()){
        return next()
    }else{
        res.redirect('/login')
    }
}

//middleware for checking if user is not authenticated

function checkNotAuthenticated(req,res,next)
{
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
     next()
}

router.get('/register', checkNotAuthenticated, (req,res)=>{
    res.render('register')
})

router.get('/login',checkNotAuthenticated, (req,res)=>{
    res.render('login')
})

router.get('/users_profile/:id', async(req,res) =>{
    const _id = req.params.id
    try{
        const user = req.user
       const person =  await User.findById(_id)
       res.render('users_profile' , {user:user , person:person})
    }
    catch(e)
    {
        console.log(e)
    }
})

//view all news

router.get('/allNews' , checkAuthenticated, async(req,res) =>{
    try{
    const user = req.user
    const updates = await Update.find().sort({createdAt:'desc'})
    res.render('news' , {user: user , updates:updates})
    }
    catch(e)
    {
        res.send(e)
    }
})

//view a single news

router.get('/news_view/:slug' ,checkAuthenticated, async(req,res) =>{
    const slug = req.params.slug
    try{
        const user = req.user
        const news = await Update.findOne({slug:slug})
        res.render('news_view' , {news : news , user:user})
    }
    catch(e)
    {
        res.send(e)
    }

})

//user view his/her profile

router.get('/my_profile/:slug' , checkAuthenticated, async(req,res) =>{
    const slug = req.params.slug
    try{
        const user = req.user
        await User.findOne({slug : slug})
        res.render('profile_view' , {user , user})
    }
    catch(e)
    {
        res.send(e)
    }
})

//user edit profile

router.get('/edit_profile/:slug' , checkAuthenticated, async(req,res) =>{
    const slug = req.params.slug
    try{
        const user = req.user
        await User.findOne({slug : slug})
        res.render('edit_profile' , {user , user})
    }
    catch(e)
    {
        res.send(e)
    }
})

router.put('/edit_myprofile/:id', checkAuthenticated, async(req,res)=>{
    const _id = req.params.id
    const updates = {
    first_name:req.body.first_name,
    last_name:req.body.last_name,
    email:req.body.email,
    birth:req.body.birth
    }
    try{
       const user = await User.findByIdAndUpdate(_id , updates)
        res.redirect(`/edit_profile/${user.slug}`)
    }
    catch(e){
        res.send(e)
    }
})

//password chamge view

router.get('/change_password/:slug' ,checkAuthenticated, async(req,res) =>{
    const slug = req.params.slug
    try{
        const user = req.user
        await User.findOne({slug : slug})
        res.render('change_password' , {user , user})
    }
    catch(e)
    {
        res.send(e)
    }
})

//user manage his/her posts
router.get('/manage_posts/:slug' ,checkAuthenticated, async(req,res)=>{
    const slug = req.params.slug
    
    try{
    const user = req.user
    const users = await User.find({
        _id:{$ne:user.id}
    })
    const posts = await Post.find({slug : slug}).sort({createdAt : 'desc'})
    res.render('manage_posts', {user : user , posts:posts , users:users})
    } 
    catch(e)
    {
        res.send(e)
    }
})

//user delete his/her posts

router.delete('/deletePost/:id' ,checkAuthenticated, async(req,res)=>{

    try{
    const _id = req.params.id
    await Post.findByIdAndDelete(_id)
    res.redirect("/")
    }
    catch(e)
    {
        res.send(e)
    }
})

//group chat
router.get('/group_chat' ,checkAuthenticated, async(req,res) =>{
    try{
        const user = req.user
        const messages = await Group_message.find()
        res.render('group_chat', {user:user , messages:messages})
    }
    catch(e)
    {
        res.send(e)
    }
})

//create group chat
router.post('/create_group_chat' , checkAuthenticated, async(req,res) =>{
    const messages = new Group_message({
        user_id : req.user.id,
        user_first_name : req.user.first_name,
        user_last_name : req.user.last_name,
        user_profile : req.user.image,
        message : req.body.message
    })
    try{
        await messages.save()
        res.redirect('/group_chat')
    }
    catch(e){
        res.send(e)
    }
})

//create comments
router.post('/createComment/:id' , checkAuthenticated, async(req,res) =>{
    const _id = req.params.id
    
    try{
        const comment = new Comment({
            comment : req.body.comment,
            writter_first_name : req.user.first_name,
            writter_last_name : req.user.last_name,
            writter_image : req.user.image,
        })
        const savedComment = await comment.save()
        res.redirect('/')
        try{

            await Post.findByIdAndUpdate(_id ,
                {
                    $push:{comment : savedComment}
                })
                
        }
        catch(e)
        {
            res.send(e)
        }
    }
   
    catch(e)
    {
        res.send(e)
    }

})

//view comments
router.get('/view_comments/:id', checkAuthenticated, async(req,res) =>{
    const _id = req.params.id
    try{
        const user = req.user
        const post = await Post.findById(_id)

        const comments = await Promise.all(
            post.comment.map((comm)=>{
                return comm
            })
        )
        res.render('viewComments' , {user:user , comments:comments})

    }
    catch(e)
    {
        console.log(e)
    }

})


//view messages
router.get('/messages/:id' , checkAuthenticated, async(req,res) =>{
    const _id = req.params.id
    try{
        const user = req.user
        await Message.findById(_id)
       const owner = await User.findById(_id)
        const messages = await Message.find({
    $or:[{$and:[{sender_id:user.id},{receiver_id:_id}]},{$and:[{sender_id:_id},{receiver_id:user.id}]}]
        })
        const users = await User.find({
            _id:{$ne:user.id}
        })
           
        res.render('messages' , {user : user , owner:owner , users:users , messages:messages})
    }

    catch(e)
    {
        console.log(e)
    }
}) 

//create  a single message

router.post('/createMessages/:id' , checkAuthenticated, async(req,res)=>{
    const receiver_id = req.params.id
    const message = new Message({
        sender_id : req.user.id,
        receiver_id : receiver_id,
        message : req.body.message,
        sender_first_name : req.user.first_name,
        sender_last_name: req.user.last_name,
        sender_profile : req.user.image
    })

    try{
        await message.save()
        res.redirect(`/messages/${receiver_id}`)
    }
    catch(e)
    {
        console.log(e)
    }

})

//view all likes
router.get('/view_likes/:slug', checkAuthenticated, async(req,res) =>{
    const slug = req.params.slug
    try{
        const user = req.user
        const likes = await Like.find({slug:slug}).sort({createdAt:'desc'})
        res.render('viewLikes' , {likes:likes , user:user})
}
    catch(e)
    {
        console.log(e)
    }
    
})

//create like
router.post('/likes/:id' , checkAuthenticated, async(req,res)=>{
    const _id = req.params.id

    try{
        await Post.findById(_id)
        const likes = new Like({
            liker_first_name : req.user.first_name,
            liker_last_name : req.user.last_name,
            liker_image : req.user.image,
            post_id : _id
        })    
        await likes.save()
        res.redirect('/')
        
    }
    catch(e)
    {
        console.log(e)
    }
    
})


//view all messages
router.get('/all_messages' , async(req,res)=>{
    try{
        const user = req.user
        const users = await User.find({
            _id:{$ne:user.id}
        })
        const messages = await Message.find({
            receiver_id:user.id
        }).sort({createdAt:'desc'})
        res.render('all_messages' , {users:users ,messages:messages , user:user})
    }
    catch(e){
        console.log(e)
    }
})


module.exports = router