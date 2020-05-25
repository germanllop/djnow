const express = require('express')
const router = express.Router()
const io = require('../config/socketio')
const path = require('path')
const jimp = require('jimp')

const multer  = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, req.user._id + '-' + Date.now() + path.extname(file.originalname))
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
            .write(req.file.path)
    })
    const user = await userController.updateUser(req.user,{
        picture:{
            data:{
                url: process.env.BASE_URL+'/uploads/'+req.file.filename
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
            .write(req.file.path)
    })
    const user = await userController.updateUser(req.user,{
        pictures:[process.env.BASE_URL+'/uploads/'+req.file.filename]
    })
    res.send(user)
})

module.exports = router