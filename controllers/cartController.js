const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");

const loadCart = async (req, res) => {
    try {
        const user = req.session.user_id;

        // Query the Cart collection and populate the 'items.product' field with actual product data
        const cartItems = await Cart.find({ user_id: user }).populate('items.product');

        let subtotal = 0;
        if (cartItems.length > 0) {
            subtotal = cartItems.reduce((total, cartItem) => {
                const productTotalPrice = cartItem.items.reduce((itemTotal, item) => {
                    const productPrice = item.product.price; // Access product price from 'item.product'
                    const quantity = item.quantity;
                    return itemTotal + productPrice * quantity;
                }, 0);

                return total + productTotalPrice;
            }, 0);
        }

        res.render('cart', { data: cartItems, subtotal: subtotal, user: req.session.user_id });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const updateCart = async (req, res) => {
    try {
        const user = req.session.user_id;
        const productID = req.body.productID;
        const quantity = req.body.quantity;

        // Find the cart item with the specified product ID and user ID
        const updatedCartItem = await Cart.findOneAndUpdate(
            { 'items.product': productID, user_id: user },
            { $set: { 'items.$.quantity': quantity } },
            { new: true }
        );

        // Send the updated cart item back to the client
        res.json(updatedCartItem);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const addToCart = async (req, res) => {
    try {
        const productId = req.body.id;
        const user_id = req.session.user_id;
        const quantity = req.body.quantity;

        let cartItem = await Cart.findOne({ user_id });

        if (cartItem) {
            // Check if the product is already in the cart
            const existingProductIndex = cartItem.items.findIndex(item => item.product.equals(productId));

            if (existingProductIndex !== -1) {
                return res.status(200).json({ message: "Product already in cart" });
            } else {
                // If the product is not in the cart, add it with the given quantity
                cartItem.items.push({ product: productId, quantity: parseInt(quantity, 10) });
            }

            await cartItem.save();
            return res.status(200).json({ message: "Product added to cart successfully" });
        } else {
            // If the user doesn't have a cart, create one and add the product
            const newCartItem = new Cart({
                user_id,
                items: [{ product: productId, quantity: parseInt(quantity, 10) }],
            });
            await newCartItem.save();
            return res.status(200).json({ message: "Product added to cart successfully" });
            
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};


const removeProduct = async (req, res) => {
    try {
        const cartId = req.query.cartId;
        const productId = req.query.productId;

        const cart = await Cart.findById(cartId);

        // Find the index of the item with the specified productId in the items array
        const itemIndex = cart.items.findIndex(item => item.product.equals(productId));

        // Remove the item from the items array if found
        if (itemIndex !== -1) {
            cart.items.splice(itemIndex, 1);
            await cart.save();
        }

        res.redirect("/cart");
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};




module.exports = {
    loadCart,
    updateCart,
    addToCart,
    removeProduct
};
