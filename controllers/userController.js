const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel")
const Category = require("../models/categoryModel");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const Order = require("../models/orderModel");
const randomstring = require("randomstring");
const shortid = require("shortid")
const { getTotalProductsInCart } = require("../number/cartNumber")
require('dotenv').config();

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
                pass: process.env.smtp_pass,
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

//ottp sending and otp storing in session
const verifyOtp = async (req, res) => {
    try {

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
            res.render("registration", { message: "User already exists" });
        } else {
            const spassword = await securePassword(req.body.password);
            req.session.firstname = req.body.firstname;
            req.session.lastname = req.body.lastname;
            req.session.mobile = req.body.mno;
            req.session.email = req.body.email;

                        // Check if a referral code is provided in the registration form
            if (req.body.referralCode) {
                // Check if the referral code provided by the user exists
                const referringUser = await User.findOne({ referralCode: req.body.referralCode });
        
                if (referringUser) {
                req.session.referralUserId = referringUser._id; // Save referring user ID in session
                } else {
                res.render('registration', { message: 'Invalid referral code. Please use a valid referral code.' });
                return;
                }
            }
        
            // Generate a unique referral code using shortid
            const referralCode = shortid.generate();
            req.session.referralCode = referralCode; // Save referral code in session

            if (req.body.firstname && req.body.email && req.body.mno) {
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
        const referralCode = req.query.referralCode;
        res.render("registration" , { referralCode });
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
        if (req.session.otp.expiry != null) {
            if (currentTime > req.session.otp.expiry) {
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
    try {

        const referralCode = req.session.referralCode;

        if (req.body.otp === req.session.otp.code) {
            const user = new User({
                first_name: req.session.firstname,
                last_name: req.session.lastname,
                email: req.session.email,
                mobile: req.session.mobile,
                password: req.session.password,
                is_verified: 1,
                referralCode: referralCode,
                isBlock: false,
            });

            const userData = await user.save();

            if (referralCode) {
                const referringUserId = req.session.referralUserId;
                const referringUser = await User.findById(referringUserId);
        
                if (referringUser) {
                  referringUser.referredBy = userData._id;
                  await referringUser.save();
        
                  // Award a bonus of 100 to both the referrer and the referred user
                  const bonusAmount = 500;
        
                  referringUser.wallet += bonusAmount;
                  referringUser.walletHistory.push({
                    transactionDate: new Date(),
                    transactionAmount: bonusAmount,
                    transactionDetails: `Referral bonus for user ${userData.username}`,
                    transactionType: 'Deposit',
                  });
                  await referringUser.save();
        
                  userData.wallet += bonusAmount;
                  userData.walletHistory.push({
                    transactionDate: new Date(),
                    transactionAmount: bonusAmount,
                    transactionDetails: 'Referral bonus',
                    transactionType: 'Deposit',
                  });
                  await userData.save();
                }
              }

            res.render("login");
        } else {
            res.render("otp", { message: "Invalid OTP" });
        }
    } catch (error) {
        console.log(error.message);
    }
};

//Login user methods started

const loginLoad = async (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        console.log(error.message);
    }
};

const loadLogout = async (req, res) => {
    try {
        req.session.user_id = null;

        res.redirect("/");
    } catch (error) {
        console.log(error.message);
    }
};

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        var userData = await User.findOne({ email: email });

        if (userData) {
            if (userData.isBlock === false) {
                const passwordMatch = await bcrypt.compare(password, userData.password);

                if (passwordMatch) {
                    if (userData.is_verified == 0) {
                        res.render("login", { message: "Please verify your email" });
                    } else {
                        req.session.user_id = userData._id;

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

        if (userData) {
            if (userData.is_verified === 0) {
                res.render("forgotPassword", { message: "Please verify your mail" });
            } else {
                const randomString = randomstring.generate();

                const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } });

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

//==================== H O M E =========================================

const login = async (req, res) => {
    try {
        const products = await Product.find().limit(5);

        const getTotalProductsInCart = async (userId) => {
            try {
                const userCart = await Cart.findOne({ user_id: userId });
                if (userCart && userCart.items.length > 0) {
                    const uniqueProductIds = new Set(userCart.items.map(item => item.product.toString()));
                    const totalProducts = uniqueProductIds.size;
                    return totalProducts;
                } else {
                    return 0; // No items in the cart
                }
            } catch (error) {
                throw error;
            }
        };

        const userId = req.session.user_id;
        const totalProductsInCart = await getTotalProductsInCart(userId);
        const categoryProductCounts = await getCategoryProductCounts();

        res.render("home", { 
            user: req.session.user_id, 
            products, 
            count: totalProductsInCart ,
            categoryProductCounts: categoryProductCounts,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};


//-------loading shop page------------//

const getCategoryProductCounts = async () => {
    try {
      const categoryCounts = await Product.aggregate([
        {
          $match: { status: true } // Add this $match stage to filter products with status true
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]);
  
      const results = await Promise.all(
        categoryCounts.map(async (categoryCount) => {
          const category = await Category.findById(categoryCount._id);
          return {
            categoryName: category.categoryname,
            productCount: categoryCount.count,
          };
        })
      );
  
      return results;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  

  const loadShop = async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const search = req.query.search ? req.query.search : "";
        const userId = req.session.user_id;
        const totalProductsInCart = await getTotalProductsInCart(userId);
        const limit = 9;

        const filterOptions = {};

        // Price Filter
        if (req.query.minPrice && req.query.maxPrice) {
            filterOptions.price = {
                $gte: parseFloat(req.query.minPrice),
                $lte: parseFloat(req.query.maxPrice),
            };
        }

        // Size Filter
        if (req.query.size) {
            filterOptions.size = req.query.size;
        }

        const countPipeline = [
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                { productname: { $regex: ".*" + search + ".*", $options: "i" } },
                                { size: { $regex: ".*" + search + ".*", $options: "i" } },
                            ],
                        },
                        filterOptions,
                        { status: true }, // Only get products with status true
                    ],
                },
            },
            {
                $count: "count",
            },
        ];

        const countResult = await Product.aggregate(countPipeline);

        const count = countResult.length > 0 ? countResult[0].count : 0;

        const totalPages = Math.ceil(count / limit);

        const pipeline = [
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                { productname: { $regex: ".*" + search + ".*", $options: "i" } },
                                { size: { $regex: ".*" + search + ".*", $options: "i" } },
                            ],
                        },
                        filterOptions,
                        { status: true }, // Only get products with status true
                    ],
                },
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
            {
                $lookup: {
                    from: "categories", // Assuming your category collection is named "categories"
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $unwind: "$category",
            },
            {
                $project: {
                    _id: 1,
                    productname: 1,
                    size: 1,
                    price: 1,
                    description: 1,
                    image: 1,
                    quantity: 1,
                    status: 1,
                    createdAt: 1,
                    discountPercentage: 1,
                    discountedPrice: 1,
                    "category.categoryname": 1,
                },
            },
        ];

        const productData = await Product.aggregate(pipeline);

        productData.forEach((product) => {
            product.price = parseFloat(product.price);
        });

        const categoryProductCounts = await getCategoryProductCounts();

        res.render("shop", {
            user: req.session.user_id,
            Product: productData,
            totalPages: totalPages,
            currentPage: page,
            search: search,
            sortOption: req.query.sort,
            count: totalProductsInCart,
            categoryProductCounts: categoryProductCounts,
            filterOptions: {
                minPrice: req.query.minPrice,
                maxPrice: req.query.maxPrice,
                size: req.query.size,
            },
        });
    } catch (error) {
        console.log(error.message);
        // Handle error and send an appropriate response
        res.status(500).send('Internal Server Error');
    }
};

const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
    const discountAmount = (originalPrice * parseFloat(discountPercentage)) / 100;
    const discountedPrice = originalPrice - discountAmount;
    return discountedPrice.toFixed(2); // Round to 2 decimal places
};


const getProductsByCategory = async (req, res) => {
    try {
        const { categoryName } = req.params;
        const search = req.query.search ? req.query.search : "";
        const userId = req.session.user_id;
        const totalProductsInCart = await getTotalProductsInCart(userId);
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided

        const categoryObjectId = await Category.findOne({ categoryname: categoryName }).select('_id');

        const category = await Category.findOne({ categoryname: categoryName });
        if (!category) {
          console.log(`Category not found for name: ${categoryName}`);
          return res.status(404).send("Category not found");
        }
    
        const categoryDiscount = parseFloat(category.discountPercentage) || 0;

        if (!categoryObjectId) {
            console.log(`Category not found for name: ${categoryName}`);
            return res.status(404).send('Category not found');
        }

        const limit = 6; // Number of products per page
        const skip = (page - 1) * limit;

        const products = await Product.find({
            'category': categoryObjectId,
            status: true,
        })
        .populate('category')
        .skip(skip)
        .limit(limit);

        const totalProductsCount = await Product.countDocuments({
            'category': categoryObjectId,
            status: true,
        });

        const categoryProductCounts = await getCategoryProductCounts();
        categoryProductCounts.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

        res.render('categoryMen', {
            user: req.session.user_id,
            categoryName: categoryName,
            products: products,
            categoryProductCounts: categoryProductCounts,
            currentPage: page,
            totalPages: Math.ceil(totalProductsCount / limit),
            search: search,
            count: totalProductsInCart,
            categoryDiscount: categoryDiscount,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


///===========Rendering product info page -=-----------//

const loadProductInfo = async (req, res) => {
    try {
        const id = req.query.id;
        const userId = req.session.user_id;
        const totalProductsInCart = await getTotalProductsInCart(userId);
        const product = await Product.findById(id).populate("category");

        if (!product) {
            return res.status(404).send("Product not found");
        }
        
        const categoryId = product.category;
        
        const category = await Category.findById(categoryId);
        
        if (!category) {
            return res.status(404).send("Category not found");
        }

        const categoryDiscount = parseFloat(category.discountPercentage) || 0;

        const productSales = await Order.aggregate([
            { $unwind: "$products" },
            {
              $group: {
                _id: "$products.productId",
                totalQuantitySold: { $sum: "$products.quantity" },
              },
            },
        ]);

        const sortedProducts = productSales.sort((a, b) => b.totalQuantitySold - a.totalQuantitySold);
        const mostSellingProductIds = sortedProducts.map((product) => product._id);
        
        // Fetch product details based on the sorted IDs
        const mostSellingProducts = await Product.find({ _id: { $in: mostSellingProductIds } });
        
        // Ensure each product has an 'image' property (an array)
        const mostSellingProductsWithImages = mostSellingProducts.map((product) => {
            const productWithImage = { ...product.toObject() }; // Convert Mongoose document to plain JavaScript object
            productWithImage.image = productWithImage.image || []; // Ensure 'image' is an array
            return productWithImage;
        });

        // Calculate the minimum discounted price
        const productDiscountedPrice = product.price - (product.price * product.discountPercentage / 100);
        const categoryDiscountedPrice = product.price - (product.price * categoryDiscount / 100);
        const finalDiscountedPrice = Math.min(productDiscountedPrice, categoryDiscountedPrice);

        res.render("productDetails", { 
            Product: product, 
            data: mostSellingProducts, 
            user: req.session.user_id, 
            count: totalProductsInCart,
            categoryDiscount: categoryDiscount,
            finalDiscountedPrice: finalDiscountedPrice,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

//---------Rendering about page-----------///

const loadAbout = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const totalProductsInCart = await getTotalProductsInCart(userId);
        res.render("about", { user: req.session.user_id , count: totalProductsInCart});
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
    getProductsByCategory,
    loadProductInfo,
    loadAbout,

   
};
