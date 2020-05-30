const User = require('../models/user')
const bcrypt = require('bcryptjs')
const transporter = require('../config/nodemailer')
const whiskers = require('whiskers')
const fs = require('fs')
const path = require('path')

// Dev Function so we can use the first user

async function getByHandle(handle){    
    const user = await User.findOne(
        { handle: handle, streamer:true },
        '-follows -config -emailIsVerified -instagramId -facebookId -admin -picture -email -lastname -name')
        .populate('categories')
        .exec()
    if(user){
        return user
    }else{
        return null
    }
}

async function getOneUser(){
    const count = await User.countDocuments({streamer:true}).exec()
    const user = await User.findOne(
        {streamer:true},
        '-follows -config -emailIsVerified -token -instagramId -facebookId -admin -picture -email -lastname -name')
        .skip(Math.random() * count)
        .exec()
    if(user){
        return user
    }else{
        return null
    }
}

async function getSomeUsers(limit){
    // const count = await User.countDocuments({streamer:true}).exec()
    const users = await User.find(
        {streamer:true},
        '-follows -config -emailIsVerified -token -instagramId -facebookId -admin -picture -email -lastname -name')
        // .skip(Math.random() * count)
        .limit(limit)
        .exec()
    if(users){
        return users
    }else{
        return []
    }
}

async function getStreamAccess(token){   
    const user = await User.findOne({
        token:token
    }).exec()
    
    if(user && user.streamer){
        return 'success'
    }else{
        return 'fail'
    }
}

async function updateUser(user,data){
    let newUser = await User.findByIdAndUpdate(user.id,
        {$set:data},
        {new:true}
    ).populate('categories').exec().catch(err=>{
        console.log(err)
        return null
    })   
    return newUser
}

async function changePassword(id,newPassword){
    User.findById(id,(err,user)=>{
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(newPassword,salt, (err,hash)=>{
              if(err) console.log(err)          
              user.secret = hash
              user.save((err,newUser)=>{
                if(err) console.log(err)
                const noPassUser = newUser.toObject()
                delete noPassUser.secret
                return noPassUser
              })
            })
          })       
    })
}

async function sendConfirmationEmail(user){
    const fullUser = await User.findById(user._id,'+emailVerificationToken').exec()
    if(!fullUser.emailVerificationSent && !fullUser.emailIsVerified){
        
        const template = fs.readFileSync(path.join(__dirname, '../templates/')+'email.html','utf-8')
        const redered = whiskers.render(template,{
            fullUser:{
                url:process.env.BASE_URL+'/public/confirmEmail/'+fullUser.emailVerificationToken,
                name:fullUser.name
            }
        })
        let info =  await transporter.sendMail({
            from: '"Dj Now" <now@djnow.live>', // sender address
            to: fullUser.email, // list of receivers
            subject: "Email Verification", // Subject line
            text: "Email Verification", // plain text body
            html: redered, // html body
        })
        if(info.accepted.length){
            const date = new Date()
            fullUser.emailVerificationSent = date
            await fullUser.save()
        }
        return info
    }else{
        return null
    }
    
    
}

async function confirmEmail(token){
    const user = await User.findOne({emailVerificationToken:token}).exec()
    if(user){
        if(user.emailIsVerified){
            return user
        }else{
            user.emailIsVerified = true
            const newUser = await user.save()
            return newUser
        }
        
    }else{
        return 'Nothing to verify.'
    }
}

async function getStreamLink(req){
    const userInfo = await User.findById(req.user._id).exec()
    let ip, baseUrl, key, strToHash, md5Sum, base64Hash, urlSignature
    ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress || 
        req.connection.socket.remoteAddress
    key = 'secret2502'

    streamName = '/beat/now_'+userInfo.token
    
    baseUrl='rtmp://mixer.djnow.live/beat/now_'+userInfo.token

    strToHash = userInfo._id + streamName + key + ip

    var crypto = require('crypto')
    md5Sum = crypto.createHash('md5')
    md5Sum.update(strToHash, 'ascii')
    base64Hash = md5Sum.digest('base64')

    urlSignature = "id=" + userInfo._id + "&sign=" + base64Hash + "&ip=" + ip

    base64UrlSignature = Buffer.from(urlSignature).toString('base64')

    signedUrlWithValidInterval = baseUrl + "?publishsign=" + base64UrlSignature 
    
    userInfo.streamLink = signedUrlWithValidInterval
    await userInfo.save()

    return signedUrlWithValidInterval
}


module.exports = {
    getByHandle,
    getOneUser,
    getSomeUsers,
    getStreamAccess,
    updateUser,
    changePassword,
    confirmEmail,
    sendConfirmationEmail,
    getStreamLink
}