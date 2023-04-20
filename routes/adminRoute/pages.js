const express = require('express')
const router = new express.Router()
const bcrypt = require('bcryptjs')
const multer = require('multer')
const News = require('../../model/news')
const User = require('../../model/users')
const Post = require('../../model/posts')

router.get('/admin/', async(req,res) =>{
    try{
        const news = await News.find().sort({createdAt:'desc'})
        res.render('admin/manage_news' , {news:news})
    }
    catch(e)
    {
        console.log(e)
    }
    
})

router.delete('/delete_news/:id' , async(req,res) =>{
    const _id = req.params.id
    try{
        await News.findByIdAndDelete(_id)
        res.redirect('/admin/')
    }
    catch(e)
    {
        console.log(e)
    }
})

router.get('/admin/edit_news/:id' , async(req,res)=>{
    const _id = req.params.id
    try{
        const update = await News.findById(_id)
        res.render('admin/edit_news' , {update:update})
    }
    catch(e)
    {
        console.log(e)
    }

})

//image upload for updating news

const imgstorage = multer.diskStorage({
    destination : './public/news_images/',
    filename : (req,file,cb)=>{
        cb(null , file.fieldname + '-' +Date.now() + 
        path.extname(file.originalname))
    }
})
const imgUpload = multer({
    storage:imgstorage,
    limits : {
        fileSize:1000000
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
        return cb('error : image only')
    }
    },
})


router.put('/edit_news/:id' ,imgUpload.single('file') , async(req,res) =>{
    const _id = req.params.id
    const updates = {
        title:req.body.title,
        description:req.body.body,
        image:req.file.filename
    }
    try{
       await News.findByIdAndUpdate(_id , updates) 
       res.redirect('/admin/')
    }
    catch(e)
    {
        console.log(e)
    }
})

router.get('/admin/create_news' , async(req,res) =>{
    res.render('admin/create_news')
})


//image for creating news

const storage = multer.diskStorage({
    destination: "./public/news_images/",
    filename: (req , file , cb)=>{
        cb(null,file.fieldname + '-' + Date.now()+
        path.extname(file.originalname))
    }
})
const upload = multer({
    storage:storage,
    limits : {
        fileSize:1000000
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
        return cb('error : image only')
    }
    },
})

router.post('/create_news' , upload.single('file'), async(req,res)=>{
    try{

        const news = new News({
            title : req.body.title,
            description:req.body.body,
            image : req.file.filename
        })
        await news.save()
        res.render('admin/create_news', {news,news})
    }
    catch(e)
    {
        res.send(e)
    }
})

router.get('/admin/manage_users' , async(req,res)=>{
    try{
        const users = await User.find().sort({createdAt:"desc"})
        res.render('admin/manage_users' , {users:users})
    }
    catch(e)
    {
        console.log(e)
    }
})

router.delete('/admin/delete_user/:id' , async(req,res) =>{
    const _id = req.params.id
    try{
        await User.findByIdAndDelete(_id)
        res.redirect('/admin/manage_users')
    }
    catch(e)
    {
        console.log(e)
    }
})

router.get('/admin/edit_user/:id' , async(req,res) =>{
    const _id = req.params.id
    try{
        const person = await User.findById(_id)
        res.render('admin/edit_user' , {person:person})
    }
    catch(e)
    {
        console.log(e)
    }
})

// image upload for editing user

const imgzstorage = multer.diskStorage({
    destination : './public/profile_images/',
    filename : (req,file,cb)=>{
        cb(null , file.fieldname + '-' +Date.now() + 
        path.extname(file.originalname))
    }
})
const imgzUpload = multer({
    storage:imgzstorage,
    limits : {
        fileSize:1000000
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
        return cb('error : image only')
    }
    },
})

router.put('/admin/edit_user/:id' , imgzUpload.single('image') , async(req,res) =>{
    const _id = req.params.id
    //const hashedPassword = await bcrypt.hash(req.body.password , 10)
    const updates = {
        first_name : req.body.first_name,
        last_name : req.body.last_name,
        email : req.body.email,
        password:req.body.password,
        birth : req.body.birth,
        role : req.body.role,
        image : req.file.filename
    }
    try{
        await User.findByIdAndUpdate(_id , updates)
        res.redirect('/admin/manage_users')
    }
    catch(e)
    {
        console.log(e)
    }
})

router.get('/admin/create_users' , async(req,res)=>{
    res.render('admin/create_user')
})

//image for creating new user


const imgzstorages = multer.diskStorage({
    destination : './public/profile_images/',
    filename : (req,file,cb)=>{
        cb(null , file.fieldname + '-' +Date.now() + 
        path.extname(file.originalname))
    }
})
const imgzUploads = multer({
    storage:imgzstorages,
    limits : {
        fileSize:1000000
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
        return cb('error : image only')
    }
    },
})

router.post('/admin/create_user' , imgzUploads.single('image') , async(req,res)=>{
    const hashedPassword = await bcrypt.hash(req.body.password , 10)
    const user = new User({
        first_name:req.body.first_name,
        last_name : req.body.last_name,
        email : req.body.email,
        password: hashedPassword,
        image:req.file.filename,
        birth:req.body.birth,
        role : req.body.role
    })
    try{
        await user.save()
        res.redirect('/admin/manage_users')
    }
    catch(e)
    {
        console.log(e)
    }
})


router.get('/admin/manage_posts' , async(req,res)=>{
    try{
        const posts = await Post.find().sort({createdAt:'desc'})
        res.render('admin/manage_posts' , {posts:posts})  
    }
    catch(e)
    {
    console.log(e)
    }
})

router.delete('/admin/delete_post/:id' , async(req,res) =>{
    const _id = req.params.id
    try{
        await Post.findByIdAndDelete(_id)
        res.redirect('/admin/manage_posts')
    }
    catch(e)
    {
        console.log(e)
    }
})
module.exports = router