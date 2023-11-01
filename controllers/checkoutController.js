const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModel");

const loadCheckout = async (req, res) => {
  try {
    const userId = req.session.user_id;
    console.log(userId);
    const userData = await User.findById({_id:userId})
    console.log(userData);
    const userAddress = await Address.findOne({ userId });
    const cartData = await Cart.findOne({ user_id: userId }).populate('items.product');

    res.render('checkout', { user: userData, address: userAddress, cart: cartData });
  } catch (error) {
    console.log(error.message);  
    res.status(500).send('Internal Server Error'); 
  }
};

module.exports = {
  loadCheckout
}
