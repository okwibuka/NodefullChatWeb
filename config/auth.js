
const configuration = require('./config')

function Auth(){
    return(req,res,next) =>{
        if(req.user.role !== 'admin')
        {
            res.render('/')
        }
        res.render('/admin')
        next()
    }
}

module.exports = {
    Auth
}