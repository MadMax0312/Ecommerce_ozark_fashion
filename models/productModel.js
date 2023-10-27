const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productname: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  description:{
    type:String,
    required:true
  },
  // color: {
  //   type: String,
  //   required: true,
  // },
  image: {
    type: Array,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
    default: false,
  }
});

module.exports = mongoose.model("Product", productSchema);
