const Admin = require("../models/adminModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const path = require("path");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");

const loadOrder = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Adjust the number of orders per page as needed

        const searchQuery = req.query.search || "";
        const statusFilter = req.query.status || "";

        const filter = {};
        if (searchQuery) {
            filter.$or = [
                { _id: { $regex: searchQuery, $options: "i" } },
                // Add more fields for search as needed
            ];
        }

        if (statusFilter) {
            filter["products.status"] = statusFilter;
        }

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);

        const ordersWithFormattedDeliveryDate = orders.map((order) => {
            const orderDate = new Date(order.createdAt);
            const expectedDeliveryDate = new Date(orderDate);
            expectedDeliveryDate.setDate(orderDate.getDate() + 7);

            const formattedDeliveryDate = expectedDeliveryDate
                .toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                })
                .replace(/\//g, "-");

            return {
                ...order.toObject(),
                formattedDeliveryDate: formattedDeliveryDate,
            };
        });

        // Get order summary statistics
        const totalSales = await Order.aggregate([
            { $match: filter },
            { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
        ]);

        const orderSummary = {
            totalOrders,
            totalSales: totalSales.length > 0 ? totalSales[0].totalAmount : 0,
            averageOrderValue: totalOrders > 0 ? totalSales[0].totalAmount / totalOrders : 0,
        };

        res.render("orders", {
            orders: ordersWithFormattedDeliveryDate,
            currentPage: page,
            totalPages: totalPages,
            searchQuery: searchQuery,
            statusFilter: statusFilter,
            orderSummary: orderSummary,
        });
    } catch (error) {
        console.log(error.message);
    }
};

const viewDetails = async (req, res) => {
    try {
        const orderId = req.query.id;
        const latestOrder = await Order.findById({ _id: orderId })
            .populate({
                path: "address",
            })
            .populate({
                path: "products.productId",
            });

        res.render("orderInfo", {
            order: latestOrder,
        });
    } catch (error) {
        console.log(error.message);
    }
};

const updateProductStatus = async (req, res) => {
    try {
        const orderId = req.body.orderId;
        const productId = req.body.productId;
        const productStatus = req.body.productStatus;

        // Update product status
        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                "products._id": productId,
            },
            {
                $set: {
                    "products.$.status": productStatus,
                },
            },
            { new: true }
        ).populate("products.productId");

        const updatedOrder = await Order.findById(orderId);

        // Update payment status if all products are delivered
        if (productStatus === "Delivered") {
            await Order.findByIdAndUpdate(
                orderId,
                {
                    $set: {
                        paymentStatus: "Paid",
                    },
                },
                { new: true }
            );
        }

        res.json({ order });
    } catch (error) {
        console.error("Error updating product status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    loadOrder,
    viewDetails,
    updateProductStatus,
};
