const Admin = require("../models/adminModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");


const loadCoupons = async (req, res) => {
  try {
      res.render("coupons");
  } catch (error) {
      console.log(error.message);
  }
};

const loadAddCoupons = async (req, res) => {
  try {
      res.render("addCoupons");
  } catch (error) {
      console.log(error.message);
  }
};



module.exports = {

  loadCoupons,
  loadAddCoupons,

};
