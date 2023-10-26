const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");

const loadCart = async (req, res) => {
    try {
        const user = req.session.user_id;
        
        // Query the Cart collection and populate the product field with actual product data
        const cartItems = await Cart.find({ user_id: user }).populate('product');

        let subtotal = 0;
        if (cartItems.length > 0) {
            subtotal = cartItems.reduce((total, cartItem) => {
                const productTotalPrice = cartItem.product.reduce((itemTotal, product) => {
                    const productPrice = product.price;
                    const quantity = cartItem.quantity;
                    return itemTotal + productPrice * quantity;
                }, 0);

                return total + productTotalPrice;
            }, 0);
        }

        res.render('cart', { data: cartItems, subtotal: subtotal });
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

        let cartItem = await Cart.findOne({ user_id, product: productId });

        if (!cartItem) {
            // If the product is not in the cart, add it with the specified quantity
            cartItem = new Cart({
                user_id,
                product: [productId], // Store product IDs in an array
                quantity: parseInt(quantity, 10),
            });
            await cartItem.save();

            return res.status(200).json({ message: "Product added to cart successfully" });
        } else {
            // If the product is already in the cart, update the quantity
            cartItem.quantity += parseInt(quantity, 10);
            await cartItem.save();

            return res.status(200).json({ message: "Product quantity updated in cart successfully" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const removeProduct = async(req, res) => {
    try{

        const cartId = req.query.cartId;
        const productId = req.query.productId;

        const cart = await Cart.findById(cartId);

        cart.product.pull(productId);

        await cart.save();

        res.redirect("/cart");

    }catch(error){
        console.log(error.message);
    }
}


function calculateSubtotal(products) {
    return products.reduce((total, product) => total + product.quantity * product.price, 0);
}

// Function to calculate total
function calculateTotal(products) {
    return calculateSubtotal(products);
}


module.exports = {
    loadCart,
    addToCart,
    removeProduct
};
