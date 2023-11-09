const User = require("../models/userModel");
const { getTotalProductsInCart } = require("../number/cartNumber");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const clearCart = async (userId) => {
    try {
        await Cart.findOneAndUpdate({ user_id: userId }, { items: [] }, { new: true });
    } catch (error) {
        console.error(error.message);
        throw error;
    }
};

const loadOrder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const totalProductsInCart = await getTotalProductsInCart(userId);
        const userData = await User.findById({ _id: userId });

        // Find the latest order for the user based on the order creation timestamp
        const latestOrder = await Order.findOne({ user: userId })
            .sort({ createdAt: -1 }) // Sort in descending order to get the latest order first
            .populate({
                path: "address",
            })
            .populate({
                path: "products.productId",
            });

        res.render("order", {
            user: userId,
            userData: userData,
            count: totalProductsInCart,
            data: [latestOrder],
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const placeOrder = async (req, res) => {
    try {
        const { productsData, totalAmount, address, paymentMethod, notes } = req.body;
        const user_id = req.session.user_id;
        var payment = "";

        if (paymentMethod == "Cash on Delivery") {
            payment = "Pending";
        } else {
            payment = "Paid";
        }

        const order = new Order({
            user: user_id,
            products: productsData,
            totalAmount: totalAmount,
            address: address,
            paymentMethod: paymentMethod,
            createdAt: Date.now(),
            notes: notes,
            paymentStatus: payment,
        });

        await order.save();

        for (const productData of productsData) {
            const productId = productData.productId;
            const orderedQuantity = productData.quantity;

            await Product.findByIdAndUpdate(productId, { $inc: { quantity: -orderedQuantity } }, { new: true });
        }

        await Cart.findOneAndDelete({ user_id: user_id });

        res.status(200).json({ message: "Order placed successfully!" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const orderDetails = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const totalProductsInCart = await getTotalProductsInCart(userId);
        const userData = await User.findById({ _id: userId });

        const productId = req.query.productId;
        const productsObjectId = req.query.productIdss;

        const orderData = await Order.findOne({
            user: userId,
            'products': {
                $elemMatch: {
                    productId: productId,
                    '_id': productsObjectId
                }
            }
        }).populate({
            path: 'products.productId'
        });

        console.log(orderData);

        const product = orderData.products.find(item => {
            return item._id.toString() === productsObjectId.toString();
        });
        
        console.log("Found product:", product);

        res.render('invoice', {
            user: userId,
            userData: userData,
            count: totalProductsInCart,
            order: orderData,
            product: product,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const updateStatus = async(req, res) => {
    try {
        console.log("enterredddddd")
        const { orderId, productId, productStatus } = req.body;
    
        // Update the product status in the database
        const updatedProduct = await Product.findOneAndUpdate(
          { orderId, _id: productId },
          { $set: { status: productStatus } },
          { new: true }
        );

        console.log(updatedProduct)
    
        if (!updatedProduct) {
          return res.status(404).json({ success: false, error: 'Product not found' });
        }
    
        res.json({ success: true, product: updatedProduct });
      } catch (error) {
        console.error('Error updating product status:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
}


module.exports = {
    loadOrder,
    placeOrder,
    orderDetails,
    updateStatus,
};
