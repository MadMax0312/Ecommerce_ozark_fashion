const Product = require("../models/productModel");
const Wishlist = require("../models/wishlistModel");
const User = require("../models/userModel");
const { getTotalProductsInCart } = require("../number/cartNumber");

const loadWishlist = async (req, res) => {
    try {
        const product = await Product.find();
        const userId = req.session.user_id;
        const totalProductsInCart = await getTotalProductsInCart(userId);

        const user = req.session.user_id;

        const wishlist = await Wishlist.find({ user_id: user }).populate("product");
        console.log(wishlist);

        res.render("wishlist", { data: wishlist, user: user, count: totalProductsInCart });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
};

const addToWishlist = async (req, res) => {
    try {
        const user_id = req.session.user_id;
        if (user_id) {
            const productId = req.body.id;

            const userWishlist = await Wishlist.findOne({ user_id });

            if (userWishlist) {
                // Check if the product is already in the wishlist
                if (userWishlist.product.includes(productId)) {
                    return res.status(400).json({ message: "Product is already in the wishlist" });
                } else {
                    userWishlist.product.push(productId);
                    await userWishlist.save();
                }
            } else {
                // If the user doesn't have a wishlist, create one
                const newWishlist = new Wishlist({
                    user_id,
                    product: [productId],
                });
                await newWishlist.save();
            }
        } else {
            return res.status(401).json({ message: "User not logged in, please log in first" });
        }

        return res.json({ success: true, message: "Product added to the wishlist successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const removeProduct = async (req, res) => {
    try {
        const wishlistId = req.query.wishlistId;
        const productId = req.query.productId;

        const wishlist = await Wishlist.findById(wishlistId);

        wishlist.product.pull(productId);

        await wishlist.save();

        res.redirect("/wishlist");
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
};

module.exports = {
    loadWishlist,
    addToWishlist,
    removeProduct,
};
