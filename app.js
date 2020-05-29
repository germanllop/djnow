require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const morgan = require('morgan')
const path = require('path')
const history = require('connect-history-api-fallback')

const app = express()
const api = require('./routes/api')
const auth = require('./routes/auth')
const public = require('./routes/public')
const passport = require('./config/passport')
const socketio = require('./config/socketio')
const checkAuth = require('./helpers/checkAuth')
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:true }))
app.use(cors())
app.use(morgan('dev'))

mongoose.connect(process.env.DATABASE_URL,{ 
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
        useCreateIndex: true,
        useFindAndModify: false
    }).catch(err=>console.log(err.name))
app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
        cookie: { secure: true }
    }))

app.use(passport.initialize())
app.use(passport.session())


app.use('/api', checkAuth, api)
app.use('/auth', auth)
app.use('/public', public)
app.use(history())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads',express.static(path.join(__dirname, 'uploads')))

const server = app.listen(port,()=> console.log('Server running: Go to ' + process.env.BASE_URL + ':' + port))

socketio.use((socket,next)=>{
    session(socket.request,{},next)
  })

socketio.listen(server)

module.exports = app