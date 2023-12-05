const User = require("../models/userModel");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const { getTotalProductsInCart } = require("../number/cartNumber");
const crypto = require("crypto");

const Razorpay = require("razorpay");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY,
});

const loadWallet = async (req, res) => {
    try {
        const userId = req.session.user_id;

        const userData = await User.findById({ _id: userId });

        const totalProductsInCart = await getTotalProductsInCart(userId);

        res.render("wallet", { user: userData, count: totalProductsInCart });
    } catch (error) {
        console.log(error.message);
    }
};

const addMoneyToWallet = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { amount } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ success: true, amount: amount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const updateWallet = async (req, res) => {
    try {
        const { transactionType, transactionAmount, transactionDetails, razorpay_payment_id } = req.body;

        const user = await User.findById(req.session.user_id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.wallet += parseFloat(transactionAmount);
        user.walletHistory.push({
            transactionType,
            transactionAmount: parseFloat(transactionAmount),
            transactionDetails,
            currentBalance: user.wallet,
            razorpay_payment_id,
        });

        await user.save();

        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const verifyTransaction = async (req, res) => {
    try {
        const { order_id, razorpay_payment_id, signature } = req.body;

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
            .update(`${order_id}|${razorpay_payment_id}`)
            .digest("hex");

        console.log(generatedSignature);

        if (generatedSignature === signature) {
            res.json({ success: true });
        } else {
            res.status(400).json({ error: "Payment verification failed" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const loadReferral = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const user = await User.findById({ _id: userId });
        const totalProductsInCart = await getTotalProductsInCart(userId);
        if (user && user.referralCode) {
            res.render("referral", { userReferralCode: user.referralCode, user: user, count: totalProductsInCart });
        } else {
            res.render("referral", { user: user, count: totalProductsInCart });
        }
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    addMoneyToWallet,
    updateWallet,
    verifyTransaction,
    loadWallet,
    loadReferral,
};
