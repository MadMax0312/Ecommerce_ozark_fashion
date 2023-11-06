const User = require("../models/userModel");
const { getTotalProductsInCart } = require("../number/cartNumber");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const loadOrder = async (req, res) => {
    try {
      console.log("enterringggg");


        const user = req.session.user_id;
        const totalProductsInCart = await getTotalProductsInCart(user);
        const orders = await Order.find({ user: user }).populate({
            path: "products.productId",
        });
        const address = await Address.find();

        res.render("order", {
            user: req.session.user_id,
            count: totalProductsInCart,
            data: orders,
        });
    } catch (error) {
        console.error(error.message);
        // Handle the error and send an appropriate response to the client
        res.status(500).send("Internal Server Error");
    }
};

const placeOrder = async (req, res) => {

  console.log("placinggggg");

  try {

    const { productsData, totalAmount, address, paymentMethod, notes } = req.body;
    const user_id = req.session.user_id;

    console.log(productsData);

    const order = new Order({
      user: user_id,
      products: productsData,
      totalAmount: totalAmount,
      address: address,
      paymentMethod: paymentMethod,
      notes: notes,
    });

    console.log(order);

    await order.save();


    res.status(200).json({ message: 'Order placed successfully!' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = {
    loadOrder,
    placeOrder,
};
