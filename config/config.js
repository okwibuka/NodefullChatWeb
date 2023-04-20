
const localStrategy = require('passport-local').Strategy
const User = require('../model/users')
const mongoose = require('mongoose')
const passport = require('passport')
const bcrypt = require('bcryptjs')


passport.use(new localStrategy({usernameField:'email'}, (email,password,done)=>{
const user = User.findOne({email:email}).then((user)=>{
if(user == null){
    return done(null,false,{message: 'wrong credentials'})
}
    bcrypt.compare(password , user.password , (err,isMatch)=>{
        if(err) throw new err
        if(isMatch){
            return done(null,user)
        }else{
            return done(null,false,{message:'incorrect pasword'})
        }
    })
})
.catch(err => console.log(err))
}))

passport.serializeUser((user , done) => done(null , user.id))
passport.deserializeUser((id , done) => {
    const fetchuser = (id) => User.findById(id)
    fetchuser(id).then((user)=>{
        return done(null,user)
    })
})

