const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Wishlist = require("../models/wishlistModel");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};

//for send mail
const sendVerifyMail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: "thahirmuhammedap@gmail.com",
                pass: "hpey gbkn ncbk yrju",
            },
        });
        const mailOptions = {
            from: "thahirmuhammedap@gmail.com",
            to: email,
            subject: "For verification of mail",
            html: `<p>Hii your OTP is: <strong>${otp}</strong> </p>`,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error.message);
    }
};

//user otp
const loadOtpPage = async (req, res) => {
    try {
        res.redirect("/otp");
    } catch (error) {
        console.log(error.message);
    }
};

//ottp verification and otp storing in session
const verifyOtp = async (req, res) => {
    try {
        console.log("fbhjgdahfj");

        const otpCode = otpGenerator.generate(6, {
            digits: true,
            alphabets: false,
            specialChars: false,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
        });

        console.log(otpCode);

        const otpcurTime = Date.now() / 1000;
        const otpExpiry = otpcurTime + 45;

        const userCheck = await User.findOne({ email: req.body.email });
        if (userCheck) {
            res.send("User Already Exists");
        } else {
            const spassword = await securePassword(req.body.password);
            req.session.firstname = req.body.firstname;
            req.session.lastname = req.body.lastname;
            req.session.mobile = req.body.mno;
            req.session.email = req.body.email;

            if (req.body.firstname && req.body.email && req.body.lastname && req.body.mno) {
                if (req.body.password === req.body.cpassword) {
                    req.session.password = spassword;
                    req.session.otp = {
                        code: otpCode,
                        expiry: otpExpiry,
                    };
                    // Send OTP to the user's email
                    sendVerifyMail(req.session.email, req.session.otp.code);

                    res.render("otp");
                } else {
                    res.render("registration", { message: "Password doesn't match" });
                }
            } else {
                res.render("registration", { message: "Please enter all details" });
            }
        }
    } catch (error) {
        console.log(error);
    }
};

//-----route to sign up page-----------------------------

const loadRegister = async (req, res) => {
    try {
        res.render("registration");
    } catch (error) {
        console.log(error.message);
    }
};

//otp genarating
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

//------Resend OTP

const resendOtp = async (req, res) => {
    try {
        const currentTime = Date.now() / 1000;
        console.log("current", currentTime);
        if (req.session.otp.expiry != null) {
            if (currentTime > req.session.otp.expiry) {
                console.log("expire", req.session.otp.expiry);
                const newDigit = otpGenerator.generate(6, {
                    digits: true,
                    alphabets: false,
                    specialChars: false,
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false,
                });
                req.session.otp.code = newDigit;
                const newExpiry = currentTime + 45;
                req.session.otp.expiry = newExpiry;
                sendVerifyMail(req.session.email, req.session.otp.code);
                res.render("otp", { message: "OTP has been send to your emaiil" });
            } else {
                res.render("otp", { message: "You can request a new otp after old otp expires" });
            }
        } else {
            res.send("Please register again");
        }
    } catch (error) {
        console.log(error.message);
    }
};

///-----Inserting user details in sign up page============

const insertUser = async (req, res) => {
    console.log("Request Body:", req.body);
    try {
        console.log("ljhgghjg");
        console.log("Password from form:", req.body.password);
        if (req.body.otp === req.session.otp.code) {
            const user = new User({
                first_name: req.session.firstname,
                last_name: req.session.lastname,
                email: req.session.email,
                mobile: req.session.mobile,
                password: req.session.password,
                is_verified: 1,
                isBlock: false,
            });

            const userData = await user.save();
            console.log(userData);
            res.render("login");
        } else {
            res.render("otp", { message: "Invalid OTP" });
        }
    } catch (error) {
        console.log(error.message);
    }
};

//Login user methods started

const login = async (req, res) => {
    try {

       

        res.render("home", { user:req.session.user_id }); 
    } catch (error) {
        console.log(error.message);
    }
};

const loginLoad = async (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        console.log(error.message);
    }
};

const loadLogout = async(req, res) => {
    try{

        req.session.user_id = null;

        res.redirect('/login');

    }catch(error){
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        // console.log('email:', email);
        const password = req.body.password;
        console.log("password:", password);

        var userData = await User.findOne({ email: email });
        console.log("userData:", userData);

        if (userData) {
            if (userData.isBlock === false) {
                const passwordMatch = await bcrypt.compare(password, userData.password);
                console.log("passwordMatch:", passwordMatch);

                if (passwordMatch) {
                    if (userData.is_verified == 0) {
                        res.render("login", { message: "Please verify your email" });
                    } else {
                        req.session.user_id = userData._id;
                        console.log(req.session.user_id);

                        res.redirect("/");
                    }
                } else {
                    res.render("login", { message: "Login details are incorrect" });
                }
            } else {
                res.render("login", { message: "Your account has been blocked" });
            }
        } else {
            res.render("login", { message: "Login details are incorrect" });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const loadOtp = async (req, res) => {
    try {
        res.render("otp");
    } catch (error) {
        console.log(error.message);
    }
};

//===========Forgot Password===========////

const loadForgotPassword = async (req, res) => {
    try {
        res.render("forgotPassword");
    } catch (error) {
        console.log(error.message);
    }
};

const resetPasswordMail = async (first_name, last_name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: "thahirmuhammedap@gmail.com",
                pass: "hpey gbkn ncbk yrju",
            },
        });

        const mailOptions = {
            from: "thahirmuhammedap@gmail.com",
            to: email,
            subject: "For Reset Password",
            html: `<p> Hi, ${first_name} ${last_name}, please click here to <a href="http://127.0.0.1:8080/changePassword?token=${token}"> Reset </a> your password</p>`,
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been sent:-", info.response);
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};

const forgotVerify = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        console.log(userData);

        if (userData) {
            if (userData.is_verified === 0) {
                res.render("forgotPassword", { message: "Please verify your mail" });
            } else {
                const randomString = randomstring.generate();
                console.log(randomString);

                const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } });
                console.log(updatedData);

                resetPasswordMail(userData.first_name, userData.last_name, userData.email, randomString);

                res.render("forgotPassword", { message: "Please check your mail to reset your password" });
            }
        } else {
            res.render("forgotPassword");
        }
    } catch (error) {
        console.log(error.message);
    }
};

const loadChangePassword = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });

        if (tokenData) {
            res.render("changePassword", { user_id: tokenData._id });
        } else {
            res.render("404", { message: "Token is invalid" });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const updatePassword = async (req, res) => {
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;

        const spassword = await securePassword(password);

        const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: spassword, token: "" } });

        res.render("login", { message: "Password Updated Successfully" });
    } catch (error) {
        console.log(error.message);
    }
};

//-------loading shop page------------//

const loadShop = async (req, res) => {
    try {
        var search = "";
        if (req.query.search) {
            search = req.query.search;
        }

        var page = 1;
        if (req.query.page) {
            page = parseInt(req.query.page);
        }

        const limit = 6;

        let sortOption = {};
        if (req.query.sort === "price_low_to_high") {
            sortOption = { price: 1 };
        } else if (req.query.sort === "price_high_to_low") {
            sortOption = { price: -1 };
        }

        const count = await Product.countDocuments({
            $or: [
                { productname: { $regex: ".*" + search + ".*", $options: "i" } },
                { size: { $regex: ".*" + search + ".*", $options: "i" } },
                { price: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
            status: true, // Only get products with status true
        });

        const totalPages = Math.ceil(count / limit);

        const productData = await Product.find({
            $or: [
                { productname: { $regex: ".*" + search + ".*", $options: "i" } },
                { size: { $regex: ".*" + search + ".*", $options: "i" } },
                { price: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
            status: true, // Only get products with status true
        })
            .sort(sortOption) // Apply sorting here
            .skip((page - 1) * limit)
            .limit(limit);

        console.log(productData);

        res.render("shop", {
            user:req.session.user_id,
            Product: productData,
            totalPages: totalPages,
            currentPage: page,
            search: search,
            sortOption: req.query.sort, // Pass the sort option back to the template for indicating active sorting
        });
    } catch (error) {
        console.log(error.message);
        // Handle error and send appropriate response
    }
};

//========= User Details =======//

const loadUser = async (req, res) => {
    try {
        if (!req.session.user_id) {
            res.redirect("/login");
            return;
        }

        const userData = await User.findById(req.session.user_id);
        if (userData) {
            res.render("userProfile", { user: userData , user:req.session.user_id });
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

//=============Edit User Details ====//

const loadEditUser = async (req, res) => {
    try {
        console.log("aaaaa");
        const id = req.query.id;
        console.log("ID:", id);

        const userData = await User.findById({ _id: id });
        console.log(userData);

        if (userData) {
            res.render("editProfile", { user: userData, user:req.session.user_id, }); // Pass the category object to the template
        } else {
            res.redirect("/userProfile");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const updateProfile = async (req, res) => {
    try {
        console.log(req.body);
        const id = req.body.user_id;
        console.log("User ID:", id); // Check if user_id is received correctly

        if (!id) {
            // Handle the case where user_id is undefined or falsy
            res.status(400).send("Invalid user ID");
            return;
        }

        const updatedUserData = await User.findByIdAndUpdate(
            { _id: id }, // Use id directly here, no need for req.body.user_id
            {
                $set: {
                    first_name: req.body.firstName,
                    last_name: req.body.lastName,
                    email: req.body.email,
                    mobile: req.body.mno,
                },
            },
            { new: true } // Add this option to return the updated document
        );

        console.log(updatedUserData);

        // Redirect to the user page after successful update
        res.status(200).redirect("/userProfile");
    } catch (error) {
        console.log(error.message);
        // Handle errors appropriately, e.g., by rendering an error page
        res.status(500).send("Internal Server Error");
    }
};

///===========Rendering product info page -=-----------//

const loadProductInfo = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Product.findById(id);

        const pddata = await Product.find();

        res.render("productInfo", { Product: product, data: pddata , user:req.session.user_id,});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};


//---------Rendering about page-----------///

const loadAbout = async (req, res) => {
    try {
        res.render("about", {user:req.session.user_id,});
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    loadRegister,
    insertUser,
    loginLoad,
    loadLogout,
    verifyLogin,
    loadOtp,
    sendVerifyMail,
    verifyOtp,
    resendOtp,
    login,
    loadOtpPage,
    loadForgotPassword,
    forgotVerify,
    loadChangePassword,
    updatePassword,
    loadShop,
    loadUser,
    loadEditUser,
    updateProfile,
    loadProductInfo,
    loadAbout
};
