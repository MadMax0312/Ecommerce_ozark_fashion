const User = require("../models/userModel");
const { getTotalProductsInCart } = require("../number/cartNumber");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const crypto = require('crypto');
const Razorpay = require('razorpay')
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY
});




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
        var payment;

        if (paymentMethod == "Cash on Delivery") {
            payment = "Pending";
        }else{
            payment = "Paid"
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

        const razorpayOrder = await razorpayInstance.orders.create({
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: order._id.toString(), // Unique order ID
        });

        // Update order with Razorpay order ID
        order.razorpayOrderID = razorpayOrder.id;
        await order.save();

        res.status(200).json({
            message: "Order placed successfully!",
            razorpayOrderID: razorpayOrder.id,
        });
        
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const handleRazorpayPayment = async (req, res) => {
    try {
        const { razorpayOrderID, paymentID, signature } = req.body;

        // Construct the string to sign
        const stringToSign = `${razorpayOrderID}|${paymentID}`;

        // Create an HMAC SHA-256 hash using your secret key
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
            .update(stringToSign)
            .digest('hex');
            
        if (generatedSignature === signature) {

            const updatedOrder = await Order.findOneAndUpdate(
                { razorpayOrderID },
                { $set: { paymentStatus: 'Paid', razorpayPaymentID: paymentID } },
                { new: true }
            );

            await Cart.findOneAndDelete({ user_id: user_id });

            if (!updatedOrder) {
                console.error('Order not found or could not be updated');
                return res.status(404).json({ error: 'Order not found or could not be updated' });
            }

            res.status(200).json({ message: 'Razorpay Payment Success' });
        } else {
            console.error('Razorpay signature mismatch');
            res.status(403).json({ error: 'Razorpay signature mismatch' });
        }
    } catch (error) {
        console.error('Error handling Razorpay payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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

        const product = orderData.products.find(item => {
            return item._id.toString() === productsObjectId.toString();
        });

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

const updateStatus = async (req, res) => {
    try {

        const { orderId, productId, productStatus } = req.body;

        const order = await Order.findOne({ _id: orderId, "products._id": productId });

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order or product not found' });
        }

        const productIndex = order.products.findIndex(p => p._id.equals(productId));
        const originalStatus = order.products[productIndex].status;

        if (productStatus === "Cancelled" && originalStatus !== "Cancelled") {
            const cancelledQuantity = order.products[productIndex].quantity;

            // Assuming productId is an object with an _id property
            const productIdObject = order.products[productIndex].productId;
            const productIdValue = productIdObject._id;

            await Product.findByIdAndUpdate(productIdValue, { $inc: { quantity: cancelledQuantity } }, { new: true });
        }

        order.products[productIndex].status = productStatus;

        const updatedOrder = await order.save();

        res.json({ success: true, product: updatedOrder });
    } catch (error) {
        console.error('Error updating product status:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

const checkWalletBalance = async(req, res) => {
    try{

        const userId = req.session.user_id;
        const userData = await User.findById({ _id:userId });

        const userWalletBalance = userData.wallet;
        console.log("walletBalaceffffffffffffffffffffffffffff", userWalletBalance)
        res.json({ walletBalance: userWalletBalance });

    }catch(error){
        console.log(error.message)
    }
}

const walletTransaction = async(req, res) => {
    try{

         const { transactionType, transactionAmount, transactionDetails } = req.body;

         const userId = req.session.user_id;

        // Retrieve the user from the database
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the user's wallet amount based on the transaction type
        switch (transactionType) {
            case 'purchase':
                if (user.wallet >= transactionAmount) {
                    user.wallet -= transactionAmount;
                } else {
                    return res.status(400).json({ error: 'Insufficient funds in the wallet' });
                }
                break;
            // Add other transaction types as needed

            default:
                return res.status(400).json({ error: 'Invalid transaction type' });
        }

        // Add the transaction to walletHistory
        const newTransaction = {
            transactionDate: new Date(),
            transactionDetails,
            transactionType,
            transactionAmount,
            currentBalance: user.wallet,
        };

        user.walletHistory.push(newTransaction);

        // Save the updated user
        await user.save();

        return res.status(200).json({ message: 'Wallet transaction successful' });

    }catch(error){
        console.log(error.message)
    }
}


module.exports = {
    loadOrder,
    placeOrder,
    orderDetails,
    updateStatus,
    handleRazorpayPayment,
    checkWalletBalance,
    walletTransaction,
};
