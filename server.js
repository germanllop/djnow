const socketio = require('./config/socketio')

const greenlock = require('greenlock-express').create({
		email: "germanllop@gmail.com",
        agreeTos: true, 
        server: 'https://acme-staging-v02.api.letsencrypt.org/directory',
        approveDomains:['beta.djnow.live'],
		configDir: "./.config/acme/", 
		communityMember: true, 
		telemetry: true, 
		app: require("./app"),
		debug: true
	})
    
const server = greenlock.listen(80, 443)

socketio.use((socket,next)=>{
    session(socket.request,{},next)
  })

socketio.listen(server)