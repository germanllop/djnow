const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ""
  },
  lastname:{
      type:String,
      default:""
  },
  handle:{
    type: String,
    default:""
  },
  email:{
    type:String,
    index:true
  },
  emailIsVerified:{
    type:Boolean,
    default:false
  },
  emailVerificationToken:{
    type:String,
    select:false
  },
  emailVerificationSent:{
    type:Date,
    default:null
  },
  picture:{
      type:Object
  },
  secret:{
    type:String,
    select: false 
  },
  online:{
    type:Boolean,
    default:false
  },
  streamer: {
    type: Boolean,
    default:false
  },
  token:{
    type:String,
    default:''
  },
  streamLink:{
    type:String,
    default:null
  },
  admin: {
    type: Boolean,
    default: false
  },
  facebookId: {
    type: String,
    index:true
  },
  instagramId:{
    type: String,
    index:true
  },
  config:{
    type: Array,
    default:[]
  },
  follows: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  meta: {
    followers: Number,
    default:0
  },
  info:{
      title:{
        type:String,
        default:""
      },
      subtitle:{
        type:String,
        default:""
      },
      description:{
        type:String,
        default:""
      },
      social:{
        facebook:{
          type:String,
          default:""
        },
        instagram:{
          type:String,
          default:""
        },
        spotify:{
          type:String,
          default:""
        },
        soundcloud:{
          type:String,
          default:""
        },
        twitter:{
          type:String,
          default:""
        }
      },
      bio:{
        type:String,
        default:""
      },
      thumbnail:{
        type:String,
        default:""
      }
  },
  pictures:{
    type: Array,
    default:[]
  },
  categories:[{
    type: mongoose.Schema.ObjectId,
    ref: 'Category'
  }],
  tags:[{
    type: mongoose.Schema.ObjectId,
    ref:'Tag'
  }]
},
{
  timestamps: true
})

const User = mongoose.model('User', userSchema)

module.exports = User