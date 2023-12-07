const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const loadLogin = async (req, res, next) => {
    try {
        res.render("login");
    } catch (error) {
        next(error);
    }
};

///////----------------------Verify Login-------------------'///////////

const verifyLogin = async (req, res, next) => {
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
        next(error);
    }
};

//////==============-----LOGOUT----===========

const loadLogout = async (req, res, next) => {
    try {
        req.session.destroy();
        res.redirect("/admin");
    } catch (error) {
        next(error);
    }
};

///----------Loading user page in admin dashboard===========

const loadUsers = async (req, res, next) => {
    try {
        var search = "";
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
        next(error);
    }
};

const blockUsers = async (req, res, next) => {
    try {
        const id = req.query.id;
        const user = await User.findById(id);

        if (user) {
            user.isBlock = !user.isBlock;
            await user.save();
            return res.status(200).json({ message: "User Status Updated" });
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    loadLogin,
    verifyLogin,
    loadLogout,
    loadUsers,
    blockUsers,
};
