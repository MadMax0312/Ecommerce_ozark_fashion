const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    product: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    }],
    quantity: {
        type: Number,
        required: true,
        default: 1, // Default quantity is 1 when a new item is added to the cart
    },
});

module.exports = mongoose.model("Cart", cartSchema);
