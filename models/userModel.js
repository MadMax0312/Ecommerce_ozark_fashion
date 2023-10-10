const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  first_name:{
    type:String,
    required:true
  },
  last_name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  mobile:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  is_verified:{
    type:Number,
    default:0
  }

})

module.exports = mongoose.model('User',userSchema)