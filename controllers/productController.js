const Category = require("../models/categoryModel");
const Product = require("../models/productModel");

const viewProducts = async (req, res) => {
    try {
        var search = "";
        if (req.query.search) {
            search = req.query.search;
        }

        var page = 1;
        if (req.query.page) {
            page = req.query.page;
        }

        const limit = 5;

        const productData = await Product.find({
            $or: [
                { productname: { $regex: ".*" + search + ".*", $options: "i" } },
                { size: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        })
            .populate("category")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Product.find({
            $or: [
                { productname: { $regex: ".*" + search + ".*", $options: "i" } },
                { size: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        }).countDocuments();

        const categories = await Category.find();

        res.render("products", {
            Product: productData,
            Category: categories,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

const loadaddProducts = async (req, res) => {
    try {
        const categories = await Category.find();

        res.render("addProducts", { Category: categories });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

const addProducts = async (req, res) => {
    try {
        const productname = req.body.productname;
        const category = req.body.category;
        const size = req.body.size;
        const description = req.body.description;
        const price = req.body.price;
        const quantity = req.body.quantity;
        const discount = req.body.discount;

        const categories = await Category.find();

        const images = [];

        for (let i = 0; i < req.files.length; i++) {
            images[i] = req.files[i].filename;
        }

        if (!productname || !size || !price || !quantity || !description) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const discountedPrice = calculateDiscountedPrice(price, discount);

        const newProduct = new Product({
            productname: productname,
            category: category,
            size: size,
            description: description,
            price: price,
            image: images,
            quantity: quantity,
            discountPercentage: discount,
            discountedPrice: discountedPrice,
            createdAt: Date.now(),
            status: true,
        });

        const productData = await newProduct.save();

        if (productData) {
            res.render("addproducts", { Category: categories, message: "Product Added Successfully" });
        } else {
            res.render("addProducts", { message: "Something went wrong" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
    const discountedPrice = (originalPrice * (100 - discountPercentage)) / 100;
    return discountedPrice.toFixed(2);
};

///--------------Unlisting products-----------------------------

const unlistProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Product.findById(id);

        if (product) {
            product.status = !product.status;
            await product.save();
            return res.status(200).json({ message: "Product Status Updated" });
        } else {
            res.status(404).send("Product not found");
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

///=====      Rendering edit products page   ============//

const loadEditProducts = async (req, res) => {
    try {
        const id = req.query.id;

        const product = await Product.findById(id);

        const categories = await Category.find();

        if (product) {
            res.render("editProducts", { data: product, Category: categories });
        } else {
            res.redirect("/admin/products");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

///==============Editing products=====================

const editProduct = async (req, res) => {
    try {
        const id = req.body.id;
        let product = await Product.findById(id);

        if (product) {
            product.productname = req.body.productname;
            product.category = req.body.category;
            product.description = req.body.description;
            product.price = req.body.price;
            product.quantity = req.body.quantity;
            product.size = req.body.size;
            product.discountPercentage = req.body.discount;

            if (req.files && req.files.length > 0) {
                product.image = [];
                for (let i = 0; i < req.files.length; i++) {
                    product.image.push(req.files[i].filename);
                }
            }

            if (product.discountPercentage) {
                product.discountedPrice = calculateDiscountedPrice(product.price, product.discountPercentage);
            }

            // Save the updated product
            const updatedProduct = await product.save();

            if (updatedProduct) {
                res.redirect("/admin/view-products");
            } else {
                res.render("edit-product", { data: product, message: "Failed to update the product" });
            }
        } else {
            res.redirect("/admin/view-products");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

const deleteImage = async (req, res) => {
    try {
        const imageName = req.query.imageName;
        const productId = req.query.productId;

        try {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).send("Product not found.");
            }

            const index = product.image.findIndex((img) => (Array.isArray(img) ? img[0] : img) === imageName);
            if (index === -1) {
                return res.status(404).send("Image not found in the product.");
            }

            product.image.splice(index, 1);

            await product.save();

            if (product.image.length === 0) {
                return res.status(400).json({ error: "At least one image should be there for the product." });
            }

            if (product) {
                return res.status(200).send("Image deleted successfully.");
            } else {
                return res.status(404).send("Product not found.");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal server error.");
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const addImages = async (req, res) => {
    try {
        const productId = req.body.productId;
        const images = req.files.map((file) => file.filename);

        const product = await Product.findByIdAndUpdate(
            productId,
            {
                $push: { image: images },
            },
            { new: true }
        );

        if (product) {
            res.status(200).json({ images });
        } else {
            res.status(404).send("Product not found.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error.");
    }
};

module.exports = {
    viewProducts,
    loadaddProducts,
    addProducts,
    unlistProduct,
    editProduct,
    deleteImage,
    addImages,
    loadEditProducts,
};
