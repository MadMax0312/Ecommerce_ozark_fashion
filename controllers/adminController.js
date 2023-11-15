const Admin = require("../models/adminModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const paginate = require("../middleware/paginate");
const bcrypt = require("bcrypt");
const path = require("path");

const randomstring = require("randomstring");
const fs = require('fs');
const Order = require("../models/orderModel");

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

        const adminData = await Admin.findOne({ email: email });
        if (adminData) {

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


module.exports = {
    loadLogin,
    verifyLogin,
    loadLogout,
    loadUsers,
    blockUsers,
    loadBanner,
    loadCoupons,
    loadOrder,
};
