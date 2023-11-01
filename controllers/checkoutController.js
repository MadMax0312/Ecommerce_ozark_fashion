const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Address = require("../models/addressModel");

const loadCheckout = async(req, res) => {

  try{

    res.render('checkout', {user: req.session.user_id});

  }catch(error){
    console.log(error.message);
  }
}

module.exports = {
  loadCheckout
}
