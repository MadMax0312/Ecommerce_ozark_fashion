const User = require("../models/userModel");
const { getTotalProductsInCart } = require("../number/cartNumber");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

const randomString = require("randomstring");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY,
});

const loadOrder = async (req, res, next) => {
    try {
        const userId = req.session.user_id;
        const totalProductsInCart = await getTotalProductsInCart(userId);
        const userData = await User.findById({ _id: userId });

        // Find the latest order for the user based on the order creation timestamp
        const latestOrder = await Order.findOne({ user: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: "address",
            })
            .populate({
                path: "products.productId",
            });

        res.render("orderConfirmation", {
            user: userId,
            userData: userData,
            count: totalProductsInCart,
            data: [latestOrder],
        });
    } catch (error) {
        next(error);
    }
};

const placeOrder = async (req, res, next) => {
    try {
        const { productsData, totalAmount, address, paymentMethod, notes, couponDiscount, couponName } = req.body;
        const user_id = req.session.user_id;
        var payment;

        if (paymentMethod == "Cash on Delivery") {
            payment = "Pending";
        } else {
            payment = "Paid";
        }
        const randomOrderId = Math.floor(Math.random() * 9000000) + 1000000;

        const order = new Order({
            user: user_id,
            products: productsData.map((product) => ({
                productId: product.productId,
                quantity: product.quantity,
                price: product.price,
                subtotal: product.subtotal,
                paymentStatus: payment,
            })),
            totalAmount: totalAmount,
            address: address,
            paymentMethod: paymentMethod,
            createdAt: Date.now(),
            notes: notes,
            paymentStatus: payment,
            orderTrackId: randomOrderId,
            couponDiscount: couponDiscount,
        });

        await order.save();

        for (const productData of productsData) {
            const productId = productData.productId;
            const orderedQuantity = productData.quantity;

            await Product.findByIdAndUpdate(productId, { $inc: { quantity: -orderedQuantity } }, { new: true });
        }

        const razorpayOrder = await razorpayInstance.orders.create({
            amount: totalAmount * 100,
            currency: "INR",
            receipt: order._id.toString(), // Unique order ID
        });

        // Update order with Razorpay order ID
        order.razorpayOrderID = razorpayOrder.id;
        await order.save();

        if (couponName) {
            const coupon = await Coupon.findOne({ couponName });
            coupon.users.push(user_id);
            await coupon.save();
        }

        await Cart.findOneAndDelete({ user_id: user_id });

        res.status(200).json({
            message: "Order placed successfully!",
            razorpayOrderID: razorpayOrder.id,
        });
    } catch (error) {
        next(error);
    }
};

const handleRazorpayPayment = async (req, res, next) => {
    try {
        const { razorpayOrderID, paymentID, signature } = req.body;

        const userId = req.session.user_id;

        // Construct the string to sign
        const stringToSign = `${razorpayOrderID}|${paymentID}`;

        // Create an HMAC SHA-256 hash using your secret key
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
            .update(stringToSign)
            .digest("hex");

        if (generatedSignature === signature) {
            const updatedOrder = await Order.findOneAndUpdate(
                { razorpayOrderID },
                { $set: { paymentStatus: "Paid", razorpayPaymentID: paymentID } },
                { new: true }
            );

            await Cart.findOneAndDelete({ user_id: userId });

            if (!updatedOrder) {
                return res.status(404).json({ error: "Order not found or could not be updated" });
            }

            await Cart.findOneAndDelete({ user_id: userId });

            res.status(200).json({ message: "Razorpay Payment Success" });
        } else {
            res.status(403).json({ error: "Razorpay signature mismatch" });
        }
    } catch (error) {
        next(error);
    }
};

const orderDetails = async (req, res, next) => {
    try {
        const userId = req.session.user_id;
        const totalProductsInCart = await getTotalProductsInCart(userId);
        const userData = await User.findById(userId);

        const productId = req.query.productId;
        const productsObjectId = req.query.productIdss;

        const orderData = await Order.findOne({
            user: userId,
            products: {
                $elemMatch: {
                    productId: productId,
                    _id: productsObjectId,
                },
            },
        }).populate({
            path: "products.productId",
        });

        const product = orderData.products.find((item) => item._id.toString() === productsObjectId.toString());
        const productid = product.productId._id;
        const reviewProduct = await Product.findById(productid);

        const existingReview = reviewProduct.reviews.find((review) => review.user.toString() === userId);

        res.render("orderDetails", {
            user: userId,
            userData: userData,
            count: totalProductsInCart,
            order: orderData,
            product: product,
            existingReview: existingReview,
        });
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const { orderId, productId, productStatus } = req.body;
        const order = await Order.findOne({ _id: orderId, "products._id": productId });
        const orderData = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, error: "Order or product not found" });
        }

        const productIndex = order.products.findIndex((p) => p._id.equals(productId));
        const originalStatus = order.products[productIndex].status;

        if (productStatus === "Cancelled" && originalStatus !== "Cancelled") {
            const cancelledQuantity = order.products[productIndex].quantity;
            const productIdValue = order.products[productIndex].productId._id;

            await Product.findByIdAndUpdate(productIdValue, { $inc: { quantity: cancelledQuantity } }, { new: true });
        } else if (productStatus === "Return" && originalStatus === "Delivered") {
            const returnedQuantity = order.products[productIndex].quantity;
            const productIdValue = order.products[productIndex].productId._id;

            await Product.findByIdAndUpdate(productIdValue, { $inc: { quantity: returnedQuantity } }, { new: true });
        }

        if (productStatus === "Cancelled") {
            order.products[productIndex].paymentStatus = "Refunded";
        }

        order.products[productIndex].status = productStatus;

        if (
            productStatus === "Cancelled" &&
            (order.paymentMethod === "Razor Payment" || order.paymentMethod === "Wallet Transfer")
        ) {
            const refundAmount = order.products[productIndex].subtotal;

            const user = await User.findById(order.user);

            if (user) {
                const couponDiscount = orderData.couponDiscount || 0;

                const discountPerProduct = couponDiscount / order.products.length;

                user.wallet += refundAmount - discountPerProduct;
                user.walletHistory.push({
                    transactionDetails: `Refund for order ${order.orderTrackId}`,
                    transactionType: "Refund",
                    transactionAmount: refundAmount - discountPerProduct,
                    currentBalance: user.wallet,
                });

                await user.save();
            }
        }

        const updatedOrder = await order.save();

        res.json({ success: true, product: updatedOrder });
    } catch (error) {
        next(error);
    }
};

const checkWalletBalance = async (req, res, next) => {
    try {
        const userId = req.session.user_id;
        const userData = await User.findById({ _id: userId });

        const userWalletBalance = userData.wallet;
        res.json({ walletBalance: userWalletBalance });
    } catch (error) {
        next(error);
    }
};

const walletTransaction = async (req, res, next) => {
    try {
        const { transactionType, transactionAmount, transactionDetails } = req.body;

        const userId = req.session.user_id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        switch (transactionType) {
            case "Purchase":
                if (user.wallet >= transactionAmount) {
                    user.wallet -= transactionAmount;
                } else {
                    return res.status(400).json({ error: "Insufficient funds in the wallet" });
                }
                break;

            default:
                return res.status(400).json({ error: "Invalid transaction type" });
        }

        const newTransaction = {
            transactionDate: new Date(),
            transactionDetails,
            transactionType,
            transactionAmount,
            currentBalance: user.wallet,
        };

        user.walletHistory.push(newTransaction);

        await user.save();

        return res.status(200).json({ message: "Wallet transaction successful" });
    } catch (error) {
        next(error);
    }
};

const invoiceDownload = async (req, res, next) => {
    try {
        const { orderId } = req.query;
        const orderData = await Order.findById(orderId).populate("products.productId").populate("user");

        if (!orderData) {
            return res.status(404).send("Order not found");
        }

        const userId = req.session.user_id;
        const userData = await User.findById(userId);

        const date = new Date();

        const data = {
            orderData: orderData,
            userData: userData,
            date,
        };

        res.render('invoice', {userData,orderData,data})

        
    } catch (error) {
        next(error);
    }
};

const rateProduct = async (req, res, next) => {
    try {
        const productId = req.body.productId;
        const rating = req.body.star;
        const comment = req.body.comment;
        const userId = req.session.user_id;

        // Find the product by ID
        const product = await Product.findById(productId);

        if (product) {
            // Check if the user has already submitted a review for the product
            const existingReview = product.reviews.find((review) => review.user.toString() === userId);

            if (existingReview) {
                // User has already submitted a review, update the existing one
                existingReview.rating = rating;
                existingReview.comment = comment;
            } else {
                // User has not submitted a review, add a new one
                product.reviews.push({ user: userId, rating: rating, comment: comment });
            }

            // Calculate the new average rating for the product
            const totalRatings = product.reviews.length || 0;
            const sumOfRatings = product.reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0;

            // Update the product document with the new average rating
            product.averageRating = averageRating;

            // Save the updated product
            await product.save();

            return res.status(200).json({ message: "Thank You for you Response" });
        } else {
            res.status(404).send("Product not found");
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    loadOrder,
    placeOrder,
    orderDetails,
    updateStatus,
    handleRazorpayPayment,
    checkWalletBalance,
    walletTransaction,
    invoiceDownload,
    rateProduct,
};
