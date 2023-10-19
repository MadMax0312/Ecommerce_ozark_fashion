const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1, // Default quantity is 1 when a new item is added to the cart
  },
});

module.exports = mongoose.model("Cart", cartSchema);
