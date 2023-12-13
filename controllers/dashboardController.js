const Product = require("../models/productModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");

const loadDashboard = async (req, res, next) => {
    try {
        const userCount = await User.find().countDocuments();
        const blockCount = await User.find({ isBlock: true }).countDocuments();
        const productCount = await Product.find().countDocuments();
        const orderCount = await Order.find().countDocuments();

        const categoryCount = await Order.aggregate([
            {
                $match: {
                    paymentStatus: "Paid",
                },
            },
            {
                $unwind: "$products",
            },
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            {
                $unwind: "$productDetails",
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.category",
                    foreignField: "_id",
                    as: "categoryDetails",
                },
            },
            {
                $unwind: "$categoryDetails",
            },
            {
                $group: {
                    _id: "$categoryDetails.categoryname",
                    count: { $sum: "$products.quantity" },
                },
            },
        ]);

        const paymentMethod = await Order.aggregate([
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 },
                },
            },
        ]);

        const totalSales = await Order.aggregate([
            //  ----------- All paid Products Total  -------------------
            {
                $unwind: "$products",
            },
            {
                $match: {
                    "products.paymentStatus": "Paid",
                },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: "$products.subtotal",
                    },
                },
            },
        ]);

        const totalProductsSold = await Order.aggregate([
            { $unwind: "$products" },
            { $match: { "products.paymentStatus": "Paid" } },
            { $group: { _id: null, totalQuantity: { $sum: "$products.quantity" } } },
        ]);

        const mostSoldProduct = await Order.aggregate([
            { $unwind: "$products" },
            { $match: { "products.paymentStatus": "Paid" } },
            { $group: { _id: "$products.productId", totalQuantity: { $sum: "$products.quantity" } } },
            { $sort: { totalQuantity: -1 } },
            { $limit: 3 },
        ]);

        const mostSoldProductDetails = await Promise.all(
            mostSoldProduct.map(async (product) => {
                const productDetails = await Product.findById(product._id);
                return {
                    ...product,
                    name: productDetails ? productDetails.productname : null,
                    description: productDetails ? productDetails.description : null,
                    image: productDetails ? productDetails.image : null,
                    price: productDetails ? productDetails.price : null,
                };
            })
        );

        // Monthly Revenue
        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) },
                    "products.paymentStatus": "Paid", // Payment status condition
                },
            },
            { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
        ]);

        // Daily Revenue
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dailyRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: today,
                        $lt: tomorrow,
                    },
                    "products.paymentStatus": "Paid", // Payment status condition
                },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" },
                },
            },
        ]);

        // Yearly Revenue
        const yearlyRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }, // Current year
                    "products.paymentStatus": "Paid", // Payment status condition
                },
            },
            { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
        ]);

        const totalRevenue = await Order.aggregate([{ $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } }]);

        const walletRevenue = await Order.aggregate([
            { $match: { paymentMethod: "Wallet Transfer" } },
            { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
        ]);

        const cashOnDeliveryRevenue = await Order.aggregate([
            { $match: { paymentMethod: "Cash on Delivery" } },
            { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
        ]);

        const RazorPayRevenue = await Order.aggregate([
            { $match: { paymentMethod: "Razor Payment" } },
            { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
        ]);

        const orderData = await Order.find()
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
            })
            .populate({
                path: "products.productId",
            })
            .limit(5);

        const orderSummary = {
            totalSales: totalSales.length > 0 ? totalSales[0].totalAmount : 0,
            totalProductsSold: totalProductsSold.length > 0 ? totalProductsSold[0].totalQuantity : 0,
            mostSoldProduct: mostSoldProduct.length > 0 ? mostSoldProduct[0] : null,
            mostSoldProductDetails: mostSoldProductDetails,
            monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].totalAmount : 0,
            dailySales: dailyRevenue.length > 0 ? dailyRevenue[0].totalAmount : 0,
            yearlySales: yearlyRevenue.length > 0 ? yearlyRevenue[0].totalAmount : 0,
            totalOrder: totalRevenue.length > 0 ? totalRevenue[0].totalAmount : 0,
            totalRevenue: totalSales.length > 0 ? totalSales[0].totalAmount * 0.3 : 0,
            razorRevenue: RazorPayRevenue.length > 0 ? RazorPayRevenue[0].totalAmount : 0,
            walletRevenue: walletRevenue.length > 0 ? walletRevenue[0].totalAmount : 0,
            cashOnDeliveryRevenue: cashOnDeliveryRevenue.length > 0 ? cashOnDeliveryRevenue[0].totalAmount : 0,
            orderData: orderData,
            paymentMethod: paymentMethod,
            categoryCount: categoryCount,
        };

        res.render("home", {
            Ucount: userCount,
            Pcount: productCount,
            Bcount: blockCount,
            Ocount: orderCount,
            order: orderSummary,
        });
    } catch (error) {
        next(error);
    }
};

const getSalesDataByDate = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            return res.status(400).json({ success: false, message: "Invalid date format" });
        }

        const salesData = await Order.find({
            createdAt: {
                $gte: new Date(startDate), // Start of the day
                $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)),
            },
        });

        res.json({ success: true, data: salesData });
    } catch (error) {
        next(error);
    }
};

function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    return regex.test(dateString) && !isNaN(Date.parse(dateString));
}

module.exports = {
    loadDashboard,
    getSalesDataByDate,
};
