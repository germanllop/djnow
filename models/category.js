const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    default: ""
  },
  subtitle: {
    type:String,
    default:""
  },
  description:{
      type:String,
      default:""
  },
  pictures:{
    type:Array,
    default:['https://bulma.io/images/placeholders/480x600.png']
  },
  tags:[{
    type: mongoose.Schema.ObjectId,
    ref:'Tag'
  }]
},
{
  timestamps: true
})

const Category = mongoose.model('Category', categorySchema)

module.exports = Category