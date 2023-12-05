const mongoose = require("mongoose");

const transactionTypes = ["Deposit", "Withdrawal", "Purchase", "Refund"]; 

const userSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true,
        },
        last_name: {
            type: String,
        },
        email: {
            type: String,
            required: true,
        },
        mobile: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        is_verified: {
            type: Number,
            required: true,
            default: 0,
        },
        referralCode: {
            type: String,
            unique: true,
          },
        isBlock: {
            type: Boolean,
            required: true,
            default: true,
        },
        token: {
            type: String,
            default: "",
        },
        wallet: {
            type: Number,
            default: 0,
        },
        walletHistory: [
            {
                transactionDate: {
                    type: Date,
                    default: Date.now,
                },
                transactionDetails: {
                    type: String,
                },
                transactionType: {
                    type: String,
                    enum: transactionTypes,
                },
                transactionAmount: {
                    type: Number,
                },
                currentBalance: {
                    type: Number,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
