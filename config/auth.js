
//middleware for checking if user is not authenticated

const checkNotAuthenticated = (req,res,next) =>{
if(req.isAuthenticated()){
return res.redirect('/')
}
next()
}

//middleware for checking if user is authenticated before logging in

const checkAuthenticated = (req,res,next) =>{
if(req.isAuthenticated()){
return next()
}else{
res.redirect('/login')
}
}

module.exports = {
    checkAuthenticated ,
    checkNotAuthenticated
}
