const express = require('express')
const router = express.Router()
const io = require('../config/socketio')
const path = require('path')
const jimp = require('jimp')
const minioClient = require('../config/minio')
const fs = require('fs')

const multer  = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, 'pub_' + req.user._id + '-' + Date.now() + path.extname(file.originalname))
    }
  })
const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname)
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    }
 })

const userController = require('../controllers/userController')

router.get('/',async function(req, res){   
    res.send('Welcome to our API')
})

router.get('/checkHandle',async function(req, res){
    const userWithHandle = await userController.getByHandle(req.body.data.handle)  
    if(userWithHandle){
        res.send(false)
    }else{
        res.send(true)
    }
})

router.patch('/user', async function(req,res){
    const user = await userController.updateUser(req.user, req.body)
    res.send(user)
})

router.patch('/changePassword', async function(req,res){    
    const user = await userController.changePassword(req.user._id,req.body.newSecret)
    res.send(req.user)
})

router.put('/profilePicture',upload.single('profile'),async function(req,res){
    jimp.read(req.file.path,(err,image)=>{
        if (err) console.log(err)        
        image
            .cover(128,128)
            .write(req.file.path,()=>{
                const meta = {
                    'Content-Type': req.file.mimetype
                }
                minioClient.fPutObject(process.env.S3_BUCKET,req.file.filename,req.file.path,meta,(err,tag)=>{
                    if(err){
                        console.log(err)
                    }
                    fs.unlinkSync(req.file.path)
                })
            })
    })
    const user = await userController.updateUser(req.user,{
        picture:{
            data:{
                url: process.env.S3_BASEURL + req.file.filename
            }
        }
    })
    res.send(user)
})

router.put('/channelPicture',upload.single('channel'),async function(req,res){
    jimp.read(req.file.path,(err,image)=>{
        if (err) console.log(err)        
        image
            .cover(128,128)
            .write(req.file.path,()=>{
                const meta = {
                    'Content-Type': req.file.mimetype
                }
                minioClient.fPutObject(process.env.S3_BUCKET,req.file.filename,req.file.path,meta,(err,tag)=>{
                    if(err){
                        console.log(err)
                    }
                    fs.unlinkSync(req.file.path)
                })
            })
    })
    const user = await userController.updateUser(req.user,{
        pictures:[
            process.env.S3_BASEURL + req.file.filename,
            req.user.pictures[1]?req.user.pictures[1]:null
        ]
    })
    res.send(user)
})

router.put('/channelCover',upload.single('cover'),async function(req,res){
    jimp.read(req.file.path,(err,image)=>{
        if (err) console.log(err)        
        image
            .cover(1280,720)
            .quality(50)
            .write(req.file.path,()=>{
                const meta = {
                    'Content-Type': req.file.mimetype
                }
                minioClient.fPutObject(process.env.S3_BUCKET,req.file.filename,req.file.path,meta,(err,tag)=>{
                    if(err){
                        console.log(err)
                    }
                    fs.unlinkSync(req.file.path)
                })
            })
    })
    const user = await userController.updateUser(req.user,{
        pictures:[
            req.user.pictures[0]?req.user.pictures[0]:null,
            process.env.S3_BASEURL+req.file.filename
        ]
    })
    res.send(user)
})

router.get('/sendEmailConfirmation',async (req,res)=>{   
    let info = await userController.sendConfirmationEmail(req.user)
    res.send(info)
})

// router.get('/generateStreamLink',async (req,res)=>{   
//     let streamLink = await userController.generateStreamLink(req)
//     res.send(streamLink)
// })

router.get('/getStreamLink',async (req,res)=>{   
    let streamLink = await userController.getStreamLink(req.user)
    res.send(streamLink)
})

module.exports = router