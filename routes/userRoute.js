const express = require("express");
const session = require("express-session");
const auth = require("../middleware/userAuth");
const errorHandler =require('../middleware/errorHandler')
const config = require("../config/config");
const passport = require("passport");
const googleStrategy = require( 'passport-google-oauth2' ).Strategy;
const User = require("../models/userModel")
const shortid = require("shortid");

const userController = require("../controllers/userController");
const wishlistController = require("../controllers/wishlistController");
const cartController = require("../controllers/cartController");
const checkoutController = require("../controllers/checkoutController");
const profileController = require("../controllers/profileController");
const orderContoller = require("../controllers/orderContoller");
const walletController = require("../controllers/walletController");

const user_route = express();

user_route.use(
    session({
        secret: config.sessionSecret,
        resave: false, 
        saveUninitialized: true, 
    })
);

passport.use(new googleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"/auth/google/callback"
  },async (accessToken,refreshToken,profile,done) => {

    try {
      const user = await User.findOne({email: profile.emails[0].value});
      const referralCode = shortid.generate();
  
      if(user) {
        done(null,user);
      } else {
        const newUser = new User({
          email: profile.emails[0].value,
          first_name: profile.displayName,
          is_verified:1,
          mobile: "dummyMobile",
          password: "dummyPassword",
          referralCode:referralCode,
        });
  
        await newUser.save();
        done(null,newUser);
      }
    } catch (error) {
      done(error,false);
    }
  }
  ))
  
  passport.serializeUser((user,done) => {
    done(null,user.id); //Searialize user's id instead of profile
  })
  
  
  passport.deserializeUser(async(id,done)=> {
    try {
      const user= await User.findById(id);
      done(null,user);
    } catch (error) {
      done(error,false);
    }
  })
  
  
  user_route.get('/auth/google',passport.authenticate('google',{
    scope:["profile","email"]
  }));
  
  user_route.get('/auth/google/callback',passport.authenticate('google',{
    failureRedirect:'/login'
  }), async function (req,res) {
    console.log(req.user.email);
    const userEmail = req.user.email;
    const user = await User.findOne({email:userEmail});
  
    if(user){
      req.session.user_id = user._id;
      res.redirect('/')
    } else {
      res.redirect('/login')
    }
  
  })

user_route.set("view engine", "ejs");
user_route.set("views", "./views/users");

user_route.use(express.json());
user_route.use(express.urlencoded({ extended: true }));

//=================== R e g i s t r a t i o n  =========================

user_route.get("/register", userController.loadRegister);
user_route.post("/register", userController.verifyOtp);
user_route.get("/otp", userController.loadOtpPage);
user_route.get("/resendOtp", userController.resendOtp);
user_route.post("/otp", userController.insertUser);

//================ Login & LogOut ====================

user_route.get("/login", auth.isLogout, userController.loginLoad);
user_route.post("/login", userController.verifyLogin);
user_route.get("/logout", userController.loadLogout);

//============== P a s s w o r d ==============================

user_route.get("/forgotPassword", userController.loadForgotPassword);
user_route.post("/forgotPassword", userController.forgotVerify);
user_route.get("/changePassword", userController.loadChangePassword);
user_route.post("/changePassword", userController.updatePassword);

//======================= H O M E === S E C T I O N  ============================================================

user_route.get("/", userController.login);

user_route.get("/shop", userController.loadShop);

user_route.get('/shop/category/:categoryName', userController.getProductsByCategory);

//====================== P R O F I L E == S E C T I O N ==================================


user_route.get('/userProfile',auth.isLogin,profileController.loadProfile);
user_route.get('/address',auth.isLogin,profileController.loadAddress);
user_route.post('/addAddress',auth.isLogin,profileController.addAddress);
user_route.get('/editAddress',auth.isLogin,profileController.loadEditAddress);
user_route.post('/editAddress',auth.isLogin,profileController.editAddress);
user_route.delete('/deleteAddress',auth.isLogin, profileController.deleteAddress);
user_route.post('/updateUser',auth.isLogin,profileController.updateUser);
user_route.post('/resetPassword',auth.isLogin,profileController.resetPassword);


user_route.get('/viewOrder',auth.isLogin,profileController.loadOrderPage);
user_route.get('/orderDetails', auth.isLogin, profileController.viewDetails);


user_route.get('/wallet', auth.isLogin, walletController.loadWallet);
user_route.post('/creditMoney', auth.isLogin, walletController.addMoneyToWallet);
user_route.post('/updateWallet', auth.isLogin, walletController.updateWallet);
user_route.post('/verifypayment', auth.isLogin, walletController.verifyTransaction);

user_route.get('/referral', auth.isLogin, walletController.loadReferral);


//======================================================================

user_route.get("/product-info", userController.loadProductInfo);

//======================== W I S H L I S T == S E C T I O N ============================================

user_route.get("/wishlist", auth.isLogin, wishlistController.loadWishlist);

user_route.post("/addToWishlist", wishlistController.addToWishlist);

user_route.get("/remove-wishlist", auth.isLogin, wishlistController.removeProduct);

//===================== C A R T == S E C T I O N ===================================

user_route.get("/remove-cart", auth.isLogin, cartController.removeProduct);

user_route.get("/cart", auth.isLogin, cartController.loadCart);

user_route.post("/addToCart", cartController.addToCart);

user_route.post("/update-cart", auth.isLogin, cartController.updateCart);

user_route.get("/get-max-stock/:id", auth.isLogin, cartController.getMaxStock);


//================== C H E C K O U T == S E C T I O N  ======================

user_route.get("/checkout", auth.isLogin, checkoutController.loadCheckout);

user_route.get('/address/:id', auth.isLogin, checkoutController.getAddressById);

user_route.post("/updateAddress/:id", auth.isLogin, checkoutController.updateAddress);

user_route.post("/addNewAddress", auth.isLogin, checkoutController.addAddress);

user_route.post("/applyCoupon", auth.isLogin, checkoutController.applyCoupon);

//===================== O R D E R ========================================

user_route.get("/order", auth.isLogin, orderContoller.loadOrder);

user_route.post("/place-order", auth.isLogin, orderContoller.placeOrder);

user_route.get("/about", userController.loadAbout);

user_route.get('/invoice', auth.isLogin,  orderContoller.orderDetails);

user_route.get('/downloadInvoice', auth.isLogin, orderContoller.invoiceDownload)

user_route.post('/updateProductStatus', auth.isLogin, orderContoller.updateStatus);

user_route.post('/razorpay-payment', auth.isLogin, orderContoller.handleRazorpayPayment);

user_route.get('/checkBalance', auth.isLogin, orderContoller.checkWalletBalance);

user_route.post('/walletTransaction', auth.isLogin, orderContoller.walletTransaction);

user_route.post('/submit-rating-review', auth.isLogin, orderContoller.rateProduct);

// ========= error  page to handle=======
user_route.use(errorHandler); 

module.exports = user_route;
