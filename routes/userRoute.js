const express = require("express");
const path = require("path");
const session = require("express-session");

const config = require("../config/config");

const user_route = express();

user_route.use(
    session({
        secret: config.sessionSecret,
        resave: false, // Add this line
        saveUninitialized: true, // Add this line
    })
);

const auth = require("../middleware/userAuth");

user_route.set("view engine", "ejs");
user_route.set("views", "./views/users");

user_route.use(express.json());
user_route.use(express.urlencoded({ extended: true }));

const userController = require("../controllers/userController");
const wishlistController = require("../controllers/wishlistController");
const cartController = require("../controllers/cartController");
const addressController = require("../controllers/addressController");
const checkoutController = require("../controllers/checkoutController");
const profileController = require("../controllers/profileController");
const orderContoller = require("../controllers/orderContoller");

user_route.get("/register", userController.loadRegister);
user_route.post("/register", userController.verifyOtp);

user_route.get("/otp", userController.loadOtpPage);

user_route.get("/resendOtp", userController.resendOtp);

user_route.post("/otp", userController.insertUser);

user_route.get("/login", auth.isLogout, userController.loginLoad);
user_route.post("/login", userController.verifyLogin);

user_route.get("/logout", userController.loadLogout);

user_route.get("/forgotPassword", userController.loadForgotPassword);

user_route.post("/forgotPassword", userController.forgotVerify);

user_route.get("/changePassword", userController.loadChangePassword);

user_route.post("/changePassword", userController.updatePassword);

//======================= H O M E === S E C T I O N  ============================================================

user_route.get("/", userController.login);

user_route.get("/shop", userController.loadShop);

//====================== P R O F I L E == S E C T I O N ==================================


user_route.get('/userProfile',auth.isLogin,profileController.loadProfile);
user_route.get('/address',auth.isLogin,profileController.loadAddress);
user_route.post('/addAddress',auth.isLogin,profileController.addAddress);
user_route.get('/editAddress',auth.isLogin,profileController.loadEditAddress);
user_route.post('/editAddress',auth.isLogin,profileController.editAddress);
user_route.delete('/deleteAddress',profileController.deleteAddress);
user_route.post('/updateUser',auth.isLogin,profileController.updateUser);
user_route.post('/resetPassword',auth.isLogin,profileController.resetPassword);
user_route.get('/viewOrder',auth.isLogin,profileController.loadOrderPage);
user_route.get('/orderDetails', profileController.viewDetails);


//======================================================================

user_route.get("/product-info", userController.loadProductInfo);

//======================== W I S H L I S T == S E C T I O N ============================================

user_route.get("/wishlist", wishlistController.loadWishlist);

user_route.post("/addToWishlist", wishlistController.addToWishlist);

user_route.get("/remove-wishlist", auth.isLogin, wishlistController.removeProduct);

//===================== C A R T == S E C T I O N ===================================

user_route.get("/remove-cart", auth.isLogin, cartController.removeProduct);

user_route.get("/cart", cartController.loadCart);

user_route.post("/addToCart", cartController.addToCart);

user_route.post("/update-cart", auth.isLogin, cartController.updateCart);

user_route.get("/get-max-stock/:id", auth.isLogin, cartController.getMaxStock);


//================== C H E C K O U T == S E C T I O N  ======================

user_route.get("/checkout", checkoutController.loadCheckout);

user_route.get('/address/:id', auth.isLogin, checkoutController.getAddressById);

user_route.post("/updateAddress/:id", auth.isLogin, checkoutController.updateAddress);

user_route.post("/addNewAddress", auth.isLogin, checkoutController.addAddress);

//===================== O R D E R ========================================

user_route.get("/order", orderContoller.loadOrder);

user_route.post("/place-order", orderContoller.placeOrder);

user_route.get("/about", userController.loadAbout);

user_route.get('/invoice', orderContoller.orderDetails);

user_route.post('/updateProductStatus', orderContoller.updateStatus);

user_route.post('/razorpay-payment', orderContoller.handleRazorpayPayment);

module.exports = user_route;
