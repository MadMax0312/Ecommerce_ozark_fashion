const User = require("../models/userModel");
const { getTotalProductsInCart } = require("../number/cartNumber");
const crypto = require("crypto");

const Razorpay = require("razorpay");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const loadWallet = async (req, res, next) => {
    try {
        const userId = req.session.user_id;

        const userData = await User.findById({ _id: userId });

        const totalProductsInCart = await getTotalProductsInCart(userId);

        res.render("wallet", { user: userData, count: totalProductsInCart });
    } catch (error) {
        next(error);
    }
};

const addMoneyToWallet = async (req, res, next) => {
    try {
        const userId = req.session.user_id;
        const { amount } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ success: true, amount: amount });
    } catch (error) {
        next(error);
    }
};

const updateWallet = async (req, res, next) => {
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
        next(error);
    }
};

const verifyTransaction = async (req, res, next) => {
    try {
        const { order_id, razorpay_payment_id, signature } = req.body;

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
            .update(`${order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature === signature) {
            res.json({ success: true });
        } else {
            res.status(400).json({ error: "Payment verification failed" });
        }
    } catch (error) {
        next(error);
    }
};

const loadReferral = async (req, res, next) => {
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
        next(error);
    }
};

module.exports = {
    addMoneyToWallet,
    updateWallet,
    verifyTransaction,
    loadWallet,
    loadReferral,
};
