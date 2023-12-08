const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const { getTotalProductsInCart } = require("../number/cartNumber");

const calculateDiscountedPrice = (product, quantity) => {
    const productPrice = product.price;

    // Calculate product-level discount
    const productDiscountPercentage = parseFloat(product.discountPercentage) || 0;
    const productDiscountedPrice = productPrice - (productPrice * productDiscountPercentage) / 100;

    // Calculate category-level discount
    const category = product.category || {};
    const categoryDiscountPercentage = parseFloat(category.discountPercentage) || 0;
    const categoryDiscountedPrice = productPrice - (productPrice * categoryDiscountPercentage) / 100;

    const finalDiscountedPrice = Math.min(productDiscountedPrice, categoryDiscountedPrice);

    return {
        productDiscountedPrice: productDiscountedPrice,
        categoryDiscountedPrice: categoryDiscountedPrice,
        finalDiscountedPrice: finalDiscountedPrice,
    };
};

const loadCart = async (req, res, next) => {
    try {
        const userId = req.session.user_id;
        const totalProductsInCart = await getTotalProductsInCart(userId);

        const cartItems = await Cart.find({ user_id: userId }).populate({
            path: "items.product",
            model: "Product",
            select: "productname image price discountPercentage category",
            populate: "category", // populate the 'category' field
        });

        // Calculate discounted prices for each product in the cart
        cartItems.forEach((cartItem) => {
            cartItem.items.forEach((item) => {
                const { finalDiscountedPrice } = calculateDiscountedPrice(item.product, item.quantity);
                item.product.finalDiscountedPrice = finalDiscountedPrice;
            });
        });

        let subtotal = 0;
        if (cartItems.length > 0) {
            subtotal = cartItems.reduce((total, cartItem) => {
                const productTotalPrice = cartItem.items.reduce((itemTotal, item) => {
                    const { finalDiscountedPrice } = item.product;
                    const quantity = item.quantity;
                    return itemTotal + finalDiscountedPrice * quantity;
                }, 0);

                return total + productTotalPrice;
            }, 0);
        }

        res.render("cart", {
            data: cartItems,
            subtotal: subtotal,
            user: userId,
            count: totalProductsInCart,
        });
    } catch (error) {
        next(error);
    }
};

const updateCart = async (req, res, next) => {
    try {
        const user = req.session.user_id;
        const productID = req.body.productID;
        const quantity = req.body.quantity;

        // Find the cart item with the specified product ID and user ID
        const updatedCartItem = await Cart.findOneAndUpdate(
            { "items.product": productID, user_id: user },
            { $set: { "items.$.quantity": quantity } },
            { new: true }
        );

        // Send the updated cart item back to the client
        res.json(updatedCartItem);
    } catch (error) {
        next(error);
    }
};
const getMaxStock = async (req, res, next) => {
    try {
        const productID = req.params.id;
        const product = await Product.findById(productID);
        const maxStock = product.quantity;
        res.json({ maxStock });
    } catch (error) {
        next(error);
    }
};

const addToCart = async (req, res, next) => {
    try {
        const user_id = req.session.user_id;

        if (!user_id) {
            return res.status(401).json({ message: "User not logged in, please log in first" });
        }

        const quantity = req.body.quantity;
        const productId = req.body.id;

        const product = await Product.findById(productId);
        const maxStock = product.quantity;

        if (maxStock <= 0) {
            return res.status(402).json({ message: "Sorry, Product not available" });
        } else if (quantity > maxStock) {
            return res.status(400).json({ message: "Exceeded maximum stock limit" });
        }

        let cartItem = await Cart.findOne({ user_id });

        if (cartItem) {
            const existingProductIndex = cartItem.items.findIndex((item) => item.product.equals(productId));

            if (existingProductIndex !== -1) {
                return res.status(400).json({ message: "Product is already in cart" });
            } else {
                cartItem.items.push({ product: productId, quantity: parseInt(quantity, 10) });
                await cartItem.save();
                return res.status(200).json({ message: "Product added to cart successfully" });
            }
        } else {
            const newCartItem = new Cart({
                user_id,
                items: [{ product: productId, quantity: parseInt(quantity, 10) }],
            });
            await newCartItem.save();
            return res.status(200).json({ message: "Product added to cart successfully" });
        }
    } catch (error) {
        next(error);
    }
};

const removeProduct = async (req, res, next) => {
    try {
        const cartId = req.query.cartId;
        const productId = req.query.productId;

        const cart = await Cart.findById(cartId);

        // Find the index of the item with the specified productId in the items array
        const itemIndex = cart.items.findIndex((item) => item.product.equals(productId));

        // Remove the item from the items array if found
        if (itemIndex !== -1) {
            cart.items.splice(itemIndex, 1);
            await cart.save();
        }

        res.redirect("/cart");
    } catch (error) {
        next(error);
    }
};

module.exports = {
    loadCart,
    updateCart,
    getMaxStock,
    addToCart,
    removeProduct,
};
