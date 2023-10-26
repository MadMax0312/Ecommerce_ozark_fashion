const Product = require("../models/productModel");
const Wishlist = require("../models/wishlistModel");
const User = require("../models/userModel");

const loadWishlist = async (req, res) => {
    try {
        const product = await Product.find();

        const user = req.session.user_id;

        const wishlist = await Wishlist.find({ user_id: user }).populate("product");
        console.log(wishlist);

        res.render("wishlist", { data: wishlist });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
};

const addToWishlist = async (req, res) => {
    try {
        const productId = req.body.id;
        const user_id = req.session.user_id;

        const userWishlist = await Wishlist.findOne({ user_id });

        if (userWishlist) {
            // Check if the product is already in the wishlist
            if (userWishlist.product.includes(productId)) {
                return res.json({ success: false, message: "Product is already in the wishlist" });
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

        // Find the wishlist by ID
        const wishlist = await Wishlist.findById(wishlistId);

        // Remove the product from the product array
        wishlist.product.pull(productId);

        // Save the updated wishlist
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
