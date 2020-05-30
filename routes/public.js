const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

// router.get('/this',async function(req,res){
//     var id ="5eb22545fffb632328207a27"
//     User.findById(id,(err,user)=>{
//         bcrypt.genSalt(10,(err,salt)=>{
//             bcrypt.hash('123456',salt, (err,hash)=>{
//               if(err) console.log(err)          
//               user.secret = hash
//               user.save().then(newUser=>{
//                 res.send(newUser)
//               }).catch(err=>console.log(err))
//             })
//           })       
//     })
// })

router.get('/getStreamer/:handle',async function(req, res){
    const user = await userController.getByHandle(req.params.handle) 
    res.send(user)
})

router.get('/getStreamerSource/:token',async function(req,res){  
    let ip, today, baseUrl, key, validMinutes, strToHash, md5Sum, base64Hash, urlSignature
    ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress || 
        req.connection.socket.remoteAddress
    
    console.log(ip)
    today =  new Intl.DateTimeFormat('en', { 
        year: 'numeric', 
        month: 'numeric', 
        day: '2-digit', 
        hour:'numeric',
        minute:'numeric',
        second:'numeric',
        timeZone:'UTC'
    }).format(new Date).replace(',','')    
    
    baseUrl='https://mixer.djnow.live/beat/'+req.params.token+'/playlist.m3u8'
    key = 'secret2502' 
    validMinutes = 60

    strToHash = ip + key + today + validMinutes

    var crypto = require('crypto')
    md5Sum = crypto.createHash('md5')
    md5Sum.update(strToHash, 'ascii')
    base64Hash = md5Sum.digest('base64')

    urlSignature = "server_time=" + today  + "&hash_value=" + base64Hash + "&validminutes=" + validMinutes

    base64UrlSignature = Buffer.from(urlSignature).toString('base64')

    signedUrlWithValidInterval = baseUrl + '?wmsAuthSign=' + base64UrlSignature      
    // res.send(signedUrlWithValidInterval)
    res.send(baseUrl)
})

router.get('/getOneStreamer',async function(req, res){
    const user = await userController.getOneUser()
    res.send(user)
})

router.get('/getStreamers/:limit',async function(req, res){
    const users = await userController.getSomeUsers(parseInt(req.params.limit))
    res.send(users)
})

router.get('/getCategories',async function(req, res){
    const categories = await categoryController.getAllCategories()
    res.send(categories)
})

router.post('/canStream',async function(req,res){
    console.log(req.body)

    let newresponse = {
        PublishAuthResponse:[]
    }    

    for (let index = 0; index < req.body.PublishAuthRequest.length; index++) {
        const element = req.body.PublishAuthRequest[index]
        let token = element.stream.replace('beat/now_','')

        let status = await userController.getStreamAccess(token)
        newresponse.PublishAuthResponse.push({
            seq:element.seq,
            status:status
        }) 
    }
    console.log(newresponse)
    
    res.send(newresponse)
})

router.get('/confirmEmail/:token',async function(req,res){
    const user = await userController.confirmEmail(req.params.token)
    res.send(user)
})

module.exports = router