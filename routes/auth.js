require('dotenv').config()

const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const crypto = require("simple-crypto-js").default

const User = require('../models/user')

// Facebook auth routes
router.get('/facebook',
  passport.authenticate('facebook',{ scope: ['email'] }))

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: process.env.BASE_URL }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect(process.env.BASE_URL)
  })

// Instagram auth routes
router.get('/instagram',
  passport.authenticate('instagram',{ scope: ['user_profile'] }))

router.get('/instagram/callback', 
  passport.authenticate('instagram', { failureRedirect: process.env.BASE_URL }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.send(req.user)
    res.redirect(process.env.BASE_URL+'/profile')
  })

//Basic email and password auth routes
router.post('/login',
    passport.authenticate('local', {session:true}),
    function(req, res) {
      const newUser = req.user.toObject()
      delete newUser.secret
    res.send(newUser)
})

router.post('/signup',function checkIfValidEmail(req,res,next){
  // Check if email is valid
  User.findOne({email:req.body.email},(err,user)=>{
    if(err){
      return next(err) //Sends an error
    }else{
      if(user){
        res.status(409).send('User already exists') // Returns Conflict
      }else{
        next() // Continues to the next route to create user
      }
    }
  })
},
function createUser(req,res,next){

  let user = new User({
    email:req.body.email,
    secret:req.body.pass,
    handle:req.body.email.replace(/@.*/, "")+Math.ceil(Math.random()*10000),
    token:crypto.generateRandom(),
    emailVerificationToken:crypto.generateRandom()
  })  
  
  bcrypt.genSalt(10,(err,salt)=>{
    bcrypt.hash(user.secret,salt, (err,hash)=>{
      if(err) console.log(err)
      user.secret = hash
      user.save().then(user=>{
        const newUser = user.toObject()
        delete newUser.secret
        res.send(newUser)
        // res.redirect(process.env.BASE_URL)
      }).catch(err=>console.log(err))
    })
  })
})

router.get('/check',(req,res)=>{
  if(req.isAuthenticated()) {
    res.send(req.user)
  }else{
    res.send(null)
  }
})

router.get('/logout',(req,res)=>{
  req.logout()
  res.status(200).send(null)
  // res.redirect(process.env.BASE_URL)
})

module.exports = router