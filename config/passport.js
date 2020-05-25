require('dotenv').config()

const passport = require('passport')
const FacebookStrategy = require('passport-facebook')
const InstagramStrategy = require('passport-instagram')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const crypto = require("simple-crypto-js").default
const User = require('../models/user')

passport.serializeUser(function(user, done) {
    done(null, user.id)
})
  
passport.deserializeUser(function(id, done) {
    User.findById(id, (err, user)=>{
        done(null, user)
    }).populate('categories')   
})

// Facebook Login 
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.BASE_URL+"/auth/facebook/callback",
    profileFields: ['email','displayName','picture']
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOne({ facebookId: profile.id }, (err, user)=>{
        if(user){
            // console.log('User found',profile)
            // We can update user information here, not much in this case
            return cb(err, user)               
        }else{
            if(profile._json.email){
                User.findOne({ email: profile._json.email }, (err, user)=>{
                    if(user){
                        user.facebookId=profile.id
                        user.save((err,user)=>{
                            console.log(err)
                            return cb(err, user) 
                        })
                    }else{
                        new User({
                            facebookId: profile.id,
                            email: profile._json.email ? profile._json.email : '',
                            name: profile._json.name ? profile._json.name : '',
                            picture: profile._json.picture ? profile._json.picture : '',
                            token:crypto.generateRandom(),
                            emailVerificationToken:crypto.generateRandom()
                        }).save((err,user)=>{
                            console.log(err)
                            return cb(err, user)       
                        })
                    }
                })
            }else{
                new User({
                    facebookId: profile.id,
                    email: profile._json.email ? profile._json.email : '',
                    name: profile._json.name ? profile._json.name : '',
                    picture: profile._json.picture ? profile._json.picture : '',
                    token:crypto.generateRandom(),
                    emailVerificationToken:crypto.generateRandom()
                }).save((err,user)=>{
                    // console.log('User created',profile)
                    console.log(err)
                    return cb(err, user)       
                })
            }
            
        }        
    }).populate('categories')
  }
))

// Instagram Login
passport.use(new InstagramStrategy({
    clientID: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    callbackURL: process.env.BASE_URL+"/auth/instagram/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // User.findOne({ instagramId: profile.id }, (err, user)=>{
    //   return done(err, user) // TODO: Copiar de facebook 
    // }).populate('categories')
    return done(err, user)
  }
))

//Basic Email and Password Login
passport.use(new LocalStrategy(
function(email, password, cb) {
    User.findOne({ email: email },'+secret', function(err, user) {
        if (err) { return cb(err) }
        if (!user) { return cb(null, false) }
        if (user.secret==""){ return cb(null, false) }
        bcrypt.compare(password, user.secret, (err, success)=>{
            if(err) { return cb(err)}
            if(!success){ 
                return cb(null, false) 
            }else{
                return cb(null, user)
            }
        })
        
        
    }).populate('categories')
}))



module.exports = passport