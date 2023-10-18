const express = require("express");
const user_route = express();
const session = require("express-session");

const config = require("../config/config");

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

user_route.get('/register',userController.loadRegister);
user_route.post('/register',userController.verifyOtp);

user_route.get('/otp',userController.loadOtpPage);
user_route.post('/otp',userController.insertUser);

user_route.get('/login',userController.loginLoad);
user_route.post('/login',userController.verifyLogin);

user_route.get('/',userController.login);

user_route.get('/shop', userController.loadShop);

user_route.get('/userProfile', userController.loadUser);

user_route.get('/userProfile-Edit',auth.isLogin, userController.loadEditUser);

user_route.post('/userProfile-Edit', userController.updateProfile);


module.exports = user_route;

