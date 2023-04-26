
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  service : 'gmail',
  auth :{
    user : 'okwibuka11@gmail.com',
    pass : process.env.NodeMailPass
  }  
})

const sendWelcomeMessage = (email , name) =>{
    transporter.sendMail({
    from : 'okwibuka11@gmail.com',
    to : email,
    subject : 'thank you for joining in',
    text : `welcome ${name} for joining our chattWeb`
    }).then(()=>{
        console.log('email sent')
    }).catch(e => console.log(e))
}

const sendDeleteMessage = (email , name) =>{
    transporter.sendMail({
    from : 'okwibuka11@gmail.com',
    to : email,
    subject : 'you delete account from our chattWeb',
    text : `Dear ${name} you have deleted your account from our chattWeb`
    }).then(()=>{
        console.log('email sent')
    }).catch(e => console.log(e))
}

module.exports = {
    sendWelcomeMessage,sendDeleteMessage
}