const Admin = require("../models/adminModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const paginate = require("../middleware/paginate");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const randomstring = require("randomstring");

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};

const loadLogin = async (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        console.log(error.message);
    }
};

///////----------------------Verify Login-------------------'///////////

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log(password);

        const adminData = await Admin.findOne({ email: email });
        console.log(adminData);
        if (adminData) {
            console.log("helloo");

            const passwordMatch = await bcrypt.compare(password, adminData.password);

            if (passwordMatch) {
                if (adminData.is_admin === 0) {
                    res.render("login", { message: "Login details are incorrect" });
                } else {
                    req.session.admin_id = adminData._id; ///--------------Session Creating -----------///////////////////////////
                    res.redirect("/admin/home");
                }
            } else {
                res.render("login", { message: "Login details are incorrect" });
            }
        } else {
            res.render("login", { message: "Login details are incorrect" });
        }
    } catch (error) {
        console.log(error.message);
    }
};

//////==============-----LOGOUT----===========

const loadLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect("/admin");
    } catch (error) {
        console.log(error.message);
    }
};

//-----------------Rendering homePage-------------------------

const loadDashboard = async (req, res) => {
    try {
        // const adminData = await Admin.findById({ _id:req.session.admin_id });
        res.render("home");
    } catch (error) {
        console.log(error.message);
    }
};

///----------Loading user page in admin dashboard===========

const loadUsers = async (req, res) => {
    try {
        console.log("dfdfdfdd");
        var search = ""; //<----this is where we search for the users in dashboard -----------------
        if (req.query.search) {
            search = req.query.search;
        }

        var page = 1;
        if (req.query.page) {
            page = req.query.page;
        }

        const limit = 3;

        const userData = await User.find({
            $or: [
                { first_name: { $regex: ".*" + search + ".*", $options: "i" } }, // Case-insensitive search
                { last_name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

            console.log(userData);

        const count = await User.find({
            $or: [
                { first_name: { $regex: ".*" + search + ".*", $options: "i" } }, // Case-insensitive search
                { last_name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        }).countDocuments();

        res.render("users", {
            users: userData,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        console.log(error);
    }
};

const blockUsers = async (req, res) => {
    try {
        const id = req.query.id;
        const user = await User.findById(id);

        if (user) {
            user.isBlock = !user.isBlock;
            await user.save();
            return res.status(200).json({ message: "User Status Updated" });
        } else {
            res.status(404).send("User not found"); // Send a 404 error if user is not found
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error"); // Send a 500 error for internal server errors
    }
};

////===========Products Section -----===========\\\\\\\\\\\\\

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
                { productname: { $regex: ".*" + search + ".*", $options: "i" } }, // Case-insensitive search
                { size: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        })
            .populate("category")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Product.find({
            $or: [
                { productname: { $regex: ".*" + search + ".*", $options: "i" } }, // Case-insensitive search
                { size: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        }).countDocuments();

        const categories = await Category.find();

        const deletedImages = req.body.deleteImages || [];

     // Get the deleted images from the request

        res.render("products", {
            Product: productData,
            Category: categories,
            deletedImages: deletedImages,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            // ... other variables you're passing to the view
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

const loadaddProducts = async (req, res) => {
    try {
        // Fetch categories from the database
        const categories = await Category.find();

        // Render the addProducts.ejs template with the Category variable
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
        const images = [];
        for (let i = 0; i < req.files.length; i++) {
            images[i] = req.files[i].filename;
        }

        console.log("kjhgffg");
        const newProduct = new Product({
            productname: productname,
            category: category,
            size: size,
            description: description,
            price: price,
            // color,
            image: images,
            quantity: quantity,
            status: true,
        });
        const productData = await newProduct.save();
        console.log(productData);
        if (productData) {
            res.redirect("/admin/add-products");
        } else {
            res.render("addProducts", { message: "Something went wrong" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

///--------------Unlisting products-----------------------------

const unlistProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Product.findById(id);

        if (product) {
            product.status = !product.status;
            await product.save();
        }

        var search = ""; //<----this is where we search for the users in dashboard
        if (req.query.search) {
            search = req.query.search;
        }

        var page = 1;
        if (req.query.page) {
            page = req.query.page;
        }

        const limit = 5;

        const count = await Product.find({
            $or: [
                { productname: { $regex: ".*" + search + ".*", $options: "i" } }, // Case-insensitive search
                { size: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        }).countDocuments();

        const products = await Product.find({
            $or: [
                { productname: { $regex: ".*" + search + ".*", $options: "i" } }, // Case-insensitive search
                { size: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        })
            .populate("category")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const categories = await Category.find();

        const deletedImages = req.body.deleteImages || [];

        res.render("products", {
            Product: products,
            Category: categories,
            deletedImages: deletedImages,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        console.log(error.message);
    }
};

///=====      Rendering edit products page   ============//

const loadEditProducts = async (req, res) => {
    try {
        const id = req.query.id;
        console.log("ID:", id);

        const product = await Product.findById(id);
        console.log(product);

        const categories = await Category.find();

        if (product) {
            res.render("editProducts", { data: product, Category: categories }); // Pass the category object to the template
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
        console.log("Received Data:", req.body);

        if (product) {
            // Update product fields
            product.productname = req.body.productname;
            product.category = req.body.category;
            product.description = req.body.description;
            product.price = req.body.price;
            product.quantity = req.body.quantity;
            product.size = req.body.size;

            // Handle new images
            if (req.files && req.files.length > 0) {
                // Clear existing images if there are new images
                product.image = [];
                for (let i = 0; i < req.files.length; i++) {
                    product.image.push(req.files[i].filename);
                }
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


////////---------Category Section  -----------====================

const loadCatogories = async (req, res) => {
    try {
        const categories = await Category.find(); // Assuming you want to retrieve all categories from the database
        res.render("categories", { Category: categories });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

//---------------Rendering Add category page---------======================

const loadAddCategories = async (req, res) => {
    try {
        res.render("addCategories");
    } catch (error) {
        console.log(error.message);
    }
};

//=================Adding Category-----=====================//

const addCategory = async (req, res) => {
    try {
        const categoryname = req.body.categoryname;
        const categorydes = req.body.categorydes;

        const data = new Category({
            categoryname: categoryname,
            description: categorydes,
            status: true,
        });

        console.log(data);

        const categoryData = await data.save();

        if (categoryData) {
            res.redirect("/admin/categories");
        } else {
            res.render("addCategories", { message: "Something went wrong" });
        }
    } catch (error) {
        console.log(error.message);
    }
};

///==============To unlist Category----=================================

const unlistCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const category = await Category.findById(id);

        if (category) {
            category.status = !category.status;
            await category.save();
        }

        const categories = await Category.find();
        res.render("categories", { Category: categories });
    } catch (error) {
        console.log(error.message);
    }
};

//==============Rendering Edit Category Page--------=========================

const loadEditCatogories = async (req, res) => {
    try {
        const id = req.query.id;
        console.log("ID:", id);

        const category = await Category.findById(id);
        console.log(category);

        if (category) {
            res.render("editCategories", { data: category }); // Pass the category object to the template
        } else {
            res.redirect("/admin/categories");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

///=============Editing Category==========///////////////////

const editCategory = async (req, res) => {
    try {
        const editData = await Category.findByIdAndUpdate(
            { _id: req.body.id },
            { $set: { categoryname: req.body.categoryname, description: req.body.categorydes } }
        );

        res.redirect("/admin/categories");
    } catch (error) {
        console.log(error.message);
    }
};

//////===========Banner Section ===================/////////////////

const loadBanner = async (req, res) => {
    try {
        res.render("banner");
    } catch (error) {
        console.log(error.message);
    }
};

const loadCoupons = async (req, res) => {
    try {
        res.render("coupons");
    } catch (error) {
        console.log(error.message);
    }
};

const loadOrder = async (req, res) => {
    try {
        res.render("orders");
    } catch (error) {
        console.log(error.message);
    }
};

const loadSales = async (req, res) => {
    try {
        res.render("sales");
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    loadLogin,
    verifyLogin,
    loadLogout,
    loadDashboard,
    loadUsers,
    blockUsers,
    viewProducts,
    loadaddProducts,
    addProducts,
    unlistProduct,
    editProduct,
    loadEditProducts,
    loadCatogories,
    loadEditCatogories,
    editCategory,
    loadAddCategories,
    addCategory,
    unlistCategory,
    loadBanner,
    loadCoupons,
    loadOrder,
    loadSales,
};
