const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')
mongoose.plugin(slug)

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    default: ""
  },
  slug: { 
    type: String, 
    slug: "name",
    slug_padding_size: 1, 
    unique: true 
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