const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
                subtotal: {
                    type: Number,
                    required: true,
                },
                status: {
                    type: String,
                    enum: ["Order Placed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Return", "Processing"],
                    default: "Order Placed",
                },
                returnStatus: {
                    type: String,
                    enum: ["Return Placed", "Out for Pickup", "Returned"],
                },
                paymentStatus: {
                    type: String,
                    enum: ["Pending", "Paid", "Failed", "Refunded"],
                    default: "Pending",
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        couponDiscount: {
            type: Number,
        },
        orderTrackId: {
            type: Number,
            required: true,
        },
        address: {
            fullName: {
                type: String,
                required: true,
            },
            pincode: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            district: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            mobile: {
                type: String,
                required: true,
            },
        },
        paymentMethod: {
            type: String,
            enum: ["Cash on Delivery", "Razor Payment", "Wallet Transfer"],
            required: true,
        },
        notes: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending",
        },
        razorpayPaymentID: {
            type: String,
        },
        razorpayOrderID: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
