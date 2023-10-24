const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");

const loadCart = async (req, res) => {
    try {
        const cartItems = await Cart.find().populate("product");

        res.render("cart", { data: cartItems });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const addToCart = async (req, res) => {
    try {
        console.log("aaaaaa");
        const productId = req.body.id;
        console.log(productId);
        const product = await Cart.findById(productId);
        console.log(product);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const quantity = req.body.quantity; // Retrieve quantity from the request body

        let cartItem = await Cart.findOne({ product: productId });

        if (!cartItem) {
            // If the product is already in the cart, update the quantity
            cartItem = new Cart({
                product: product,
                quantity: parseInt(quantity, 10),
            });
            await cartItem.save();

            return res.status(200).json({ message: "Product added to wishlist successfully" });
        } else {
            cartItem.quantity += parseInt(quantity, 10);
            await cartItem.save();
            return res.status(200).json({ message: "Product quantity updated in cart successfully" });
        } 
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    loadCart,
    addToCart,
};
