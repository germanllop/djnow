const User = require('../models/user')
const bcrypt = require('bcryptjs')

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


module.exports = {
    getByHandle,
    getOneUser,
    getSomeUsers,
    getStreamAccess,
    updateUser,
    changePassword
}