const io = require('socket.io')()
const User = require('../models/user')

io.on('connection',async(socket)=>{
  console.log('Made socket connection',socket.id)

  if(socket.request.session.passport){
    console.log('Client joins user room',socket.request.session.passport.user)
    socket.join(socket.request.session.passport.user)
    await User.findByIdAndUpdate(socket.request.session.passport.user,
      {
        online: true
      }).exec()
  }else{
    socket.disconnect(true)
  }
    
  socket.on('disconnect',async(data)=>{
    
    if(socket.request.session.passport){
    console.log('Client leaves user room',socket.request.session.passport.user)
      if(!io.sockets.adapter.rooms['socket.request.session.passport.user']){
        await User.findByIdAndUpdate(socket.request.session.passport.user,
          {
            online: false
          }).exec()         
      }
      
    }
    console.log('Disconnected',socket.id,data)
  })  

})

module.exports = io