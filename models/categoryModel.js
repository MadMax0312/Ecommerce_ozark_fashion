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
  offers: [
    {
      offerName: { type: String, required:true },
      discountPercentage: { type: Number, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
  ],

})

module.exports = mongoose.model('Category',categorySchema)