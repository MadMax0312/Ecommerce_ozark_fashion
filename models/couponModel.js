const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        users: {
            type: Array,
            required: true,
        },

        couponName: {
            type: String,
            required: true,
        },

        minimumPurchase: {
            type: Number,
            required: true,
        },
      
        maximumDiscount: {
            type: Number,
            required: true,
            default: 10000, // Set a default value of 10,000
        },

        discountPercentage: {
            type: Number,
            required: true,
        },

        expiryDate: {
            type: Date,
            default: Date.now,
            required: true,
            validate: {
                validator: function (value) {
                    return this.startingDate ? value > this.startingDate : true;
                },
                message: "Expiry date must be after starting date",
            },
        },

        startingDate: {
            type: Date,
            default: Date.now,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Coupon", couponSchema);
