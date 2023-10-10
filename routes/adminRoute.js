const express = require("express");
const admin_route = express();

const session = require("express-session");
const config = require("../config/config");

admin_route.use(
  session({
    secret: config.sessionSecret,
    resave: false, 
    saveUninitialized: true, 
  })
);

admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended:true}));

admin_route.set("view engine","ejs");
admin_route.set("views","./views/admin");

admin_route.use(express.static('public'));

const auth = require("../middleware/adminAuth");

const adminController = require("../controllers/adminController");

admin_route.get('/',adminController.loadLogin);

admin_route.post('/',adminController.verifyLogin);

admin_route.get('/home',adminController.loadDashboard);

admin_route.get('/users', adminController.loadUsers);

admin_route.get('/products', adminController.loadProducts);

admin_route.get('/categories', adminController.loadCatogories);

admin_route.get('/editCategories', adminController.loadEditCatogories);

admin_route.get('/addCategories', adminController.loadAddCategories);

admin_route.post('/addCategories', adminController.addCategory);

admin_route.get('/unlist-category', adminController.unlistCategory);

admin_route.get('/banner', adminController.loadBanner);

admin_route.get('/coupons', adminController.loadCoupons);

admin_route.get('/orders', adminController.loadOrder)

admin_route.get('/sales', adminController.loadSales)

module.exports = admin_route;