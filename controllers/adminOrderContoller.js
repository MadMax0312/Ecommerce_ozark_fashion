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

        const payment = updatedOrder.paymentMethod;

        // Update payment status if all products are delivered and payment is Cash on Delivery
        if (productStatus === "Delivered" && payment === "Cash on Delivery") {
            order.products.forEach((product) => {
                if (product.status === "Delivered" && product.paymentStatus !== "Paid") {
                    product.paymentStatus = "Paid";
                }
            });
        }

        // If product status is Cancelled and payment is not Cash on Delivery, initiate refund to user wallet
        if (productStatus === "Cancelled" && payment !== "Cash on Delivery") {
            const productIndex = updatedOrder.products.findIndex((product) => product._id.equals(productId));

            // Update stock logic
            const productIdValue = updatedOrder.products[productIndex].productId._id;
            const cancelledQuantity = updatedOrder.products[productIndex].quantity;

            await Product.findByIdAndUpdate(productIdValue, { $inc: { quantity: cancelledQuantity } }, { new: true });

            const refundedProduct = updatedOrder.products[productIndex];
            const refundAmount = refundedProduct.subtotal;

            const user = await User.findById(updatedOrder.user);

            if (user) {
                const couponDiscount = updatedOrder.couponDiscount || 0;
                const discountPerProduct = couponDiscount / updatedOrder.products.length;

                user.wallet += refundAmount - discountPerProduct;
                user.walletHistory.push({
                    transactionDetails: `Refund for order ${updatedOrder.orderTrackId}`,
                    transactionType: "Refund",
                    transactionAmount: refundAmount - discountPerProduct,
                    currentBalance: user.wallet,
                });

                await user.save();
            }
        }

        await updatedOrder.save();

        res.json({ order: updatedOrder });
    } catch (error) {
        console.error("Error updating product status:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const updateReturnStatus = async (req, res) => {
    try {
        const { orderId, productId, returnStatus } = req.body;
        const order = await Order.findById(orderId);
        const product = order.products.find((product) => product._id.toString() === productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found in the order." });
        }

        product.returnStatus = returnStatus;

        if (returnStatus === "Returned") {
            const originalProduct = await Product.findById(product.productId);
            originalProduct.quantity += product.quantity;
            await originalProduct.save();
        }

        await order.save();

        res.json({ success: true, data: product });
    } catch (error) {
        console.error("Error updating return status:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const proceedRefund = async (req, res) => {
    try {
        const { orderId, productId } = req.body;

        const order = await Order.findById(orderId);

        const product = order.products.find((p) => p._id.toString() === productId);

        if (!order || !product) {
            return res.status(400).json({ success: false, error: "Invalid order or product" });
        }

        const user = await User.findById(order.user);
        if (!user) {
            return res.status(400).json({ success: false, error: "User not found" });
        }

        const couponDiscount = order.couponDiscount || 0;

        const discountPerProduct = couponDiscount / order.products.length;

        user.wallet += product.subtotal - discountPerProduct;

        const transactionDetails = `Product Refund for order: ${order.orderTrackId}`;
        const transactionAmount = product.subtotal - discountPerProduct;
        const currentBalance = user.wallet;

        user.walletHistory.push({
            transactionDetails,
            transactionType: "Refund",
            transactionAmount,
            currentBalance,
        });

        product.paymentStatus = "Refunded";

        await user.save();
        await order.save();

        res.json({ success: true, message: "Refund completed successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

module.exports = {
    loadOrder,
    viewDetails,
    updateProductStatus,
    proceedRefund,
    updateReturnStatus,
};
