const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

router.get('/this',async function(req,res){
    var id ="5eb22545fffb632328207a27"
    User.findById(id,(err,user)=>{
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash('123456',salt, (err,hash)=>{
              if(err) console.log(err)          
              user.secret = hash
              user.save().then(newUser=>{
                res.send(newUser)
              }).catch(err=>console.log(err))
            })
          })       
    })
})

router.get('/getStreamer/:handle',async function(req, res){
    const user = await userController.getByHandle(req.params.handle) 
    res.send(user)
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