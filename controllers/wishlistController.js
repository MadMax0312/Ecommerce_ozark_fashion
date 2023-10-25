const Product = require("../models/productModel");
const Wishlist = require("../models/wishlistModel");

const loadWishlist = async (req, res) => {
    try {

        const product = await Product.find()

        const wishlist = await Wishlist.find().populate("product");
      
        res.render("wishlist", { 
          data: wishlist         
         
        }); 
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const addToWishlist = async (req, res) => {
    try {
      console.log("aaaaaa");
        const productId = req.body.id;
        console.log(productId); 
        const product = await Product.findById(productId);


        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        let wishItem = await Wishlist.findOne({ product: productId });

        if (!wishItem) {

            wishItem = new Wishlist({
                product: product._id,
            });
            await wishItem.save();
            await wishItem.save();
            // res.render('productInfo', { message: "Product added to wishlist successfully" })
            await wishItem.save();  
            // res.render('productInfo', { message: "Product added to wishlist successfully" })
            return res.status(200).json({ message: "Product added to wishlist successfully" });

        }else{

            return res.status(400).json({ error: "Product already in wishlist" });
 
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const removeProduct = async(req, res) => {

    try {

    const id = req.query.id;
    console.log(id);
    await Wishlist.deleteOne({ _id:id });
    res.redirect('/wishlist');

    }catch(error){
        console.log(error.message); 
    }
}
  
module.exports = {
    loadWishlist,
    addToWishlist,
    removeProduct
};
