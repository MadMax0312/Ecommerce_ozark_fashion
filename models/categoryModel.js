const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({

  categoryname:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  status:{
    type:Boolean,
    required:true,
    default:0
  },
  discount: {
    type: String,
    default: 0,  
},

})

module.exports = mongoose.model('Category',categorySchema)