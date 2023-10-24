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

user_route.set("view engine","ejs");
user_route.set("views","./views/users");

user_route.use(express.json());
user_route.use(express.urlencoded({extended:true}));

const userController = require("../controllers/userController");
const wishlistController = require("../controllers/wishlistController");
const cartController = require("../controllers/cartController");

user_route.get('/register',userController.loadRegister);
user_route.post('/register',userController.verifyOtp);

user_route.get('/otp',userController.loadOtpPage);

user_route.get('/resendOtp', userController.resendOtp);

user_route.post('/otp',userController.insertUser);

user_route.get('/login', auth.isLogout, userController.loginLoad);
user_route.post('/login',userController.verifyLogin);

user_route.get('/forgotPassword', userController.loadForgotPassword);

user_route.post('/forgotPassword', userController.forgotVerify); 

user_route.get('/changePassword', userController.loadChangePassword);

user_route.post('/changePassword', userController.updatePassword);

user_route.get('/',userController.login);

user_route.get('/shop', userController.loadShop);

user_route.get('/userProfile', userController.loadUser);

user_route.get('/userProfile-Edit',auth.isLogin, userController.loadEditUser);

user_route.post('/userProfile-Edit', userController.updateProfile);

user_route.get('/product-info', userController.loadProductInfo);

user_route.get('/wishlist', wishlistController.loadWishlist);

user_route.post('/addToWishlist', wishlistController.addToWishlist);

user_route.get('/cart', cartController.loadCart);

user_route.post('/addToCart', userController.addToCart);

user_route.get('/about', userController.loadAbout)

module.exports = user_route;

