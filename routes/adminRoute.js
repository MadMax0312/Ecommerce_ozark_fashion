const express = require("express");
const cors = require('cors');
const admin_route = express();

const session = require("express-session");
const config = require("../config/config");

admin_route.use(cors())

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

//----------To Add Images ---=======================

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,path.join(__dirname,'../public/Assets/images'));
  },
  filename:function(req,file,cb) {
    const name = Date.now()+'-'+file.originalname;
    cb(null,name)
  }
})
 
const upload = multer({storage:storage});

const auth = require("../middleware/adminAuth");
const paginate = require("../middleware/paginate");

const adminController = require("../controllers/adminController");

admin_route.get('/',adminController.loadLogin);

admin_route.post('/',adminController.verifyLogin);

admin_route.get('/home', adminController.loadDashboard);

admin_route.get('/users', adminController.loadUsers); 

admin_route.get('/block-user', adminController.blockUsers); 

admin_route.get('/view-products', adminController.viewProducts);

admin_route.get('/add-products', adminController.loadaddProducts);

admin_route.post('/add-products', upload.single('image'), adminController.addProducts);

admin_route.get('/unlist-product', adminController.unlistProduct);

admin_route.get('/edit-product', adminController.loadEditProducts);

admin_route.post('/edit-product', upload.single('image'), adminController.editProduct);

admin_route.get('/categories', adminController.loadCatogories);

admin_route.get('/editCategories', adminController.loadEditCatogories);

admin_route.post('/editCategories', adminController.editCategory);

admin_route.get('/addCategories', adminController.loadAddCategories);

admin_route.post('/addCategories', adminController.addCategory);

admin_route.get('/unlist-category', adminController.unlistCategory);

admin_route.get('/banner', adminController.loadBanner);

admin_route.get('/coupons', adminController.loadCoupons);

admin_route.get('/orders', adminController.loadOrder)

admin_route.get('/sales', adminController.loadSales)

// admin_route.get('/view-products', adminController.view)

module.exports = admin_route;