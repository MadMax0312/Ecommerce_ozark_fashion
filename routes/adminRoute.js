const express = require("express");
const session = require("express-session");

const config = require("../config/config");
const auth = require("../middleware/adminAuth");

const multer = require("multer");
const path = require("path");

const admin_route = express();

admin_route.use(
    session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: true,
    })
);

admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");

admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));

admin_route.use(express.static("public"));

//----------To Add Images ---=======================

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/admin/Assets/images/products"));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + "-" + file.originalname;
        cb(null, name);
    },
});

const upload = multer({ storage: storage });

const productController = require("../controllers/productController");

const categoryController = require("../controllers/categoryController");

const adminController = require("../controllers/adminController");

const adminOrderController = require("../controllers/adminOrderContoller");

const dashboardController = require("../controllers/dashboardController");

const salesController = require("../controllers/salesController");

const couponController = require("../controllers/couponController");

admin_route.get("/", auth.isLogout, adminController.loadLogin);

admin_route.post("/", adminController.verifyLogin);

admin_route.get("/logout", auth.isLogin, adminController.loadLogout);

admin_route.get("/users", auth.isLogin, adminController.loadUsers);

admin_route.post("/block-user", auth.isLogin, adminController.blockUsers);

//==================================================================================

admin_route.get("/home", auth.isLogin, dashboardController.loadDashboard);

//=================================  P R O D U C T === S E C T I O N  =================================================================================//

admin_route.get("/view-products", auth.isLogin, productController.viewProducts);

admin_route.get("/add-products", productController.loadaddProducts);

admin_route.post("/add-products", upload.array("images", 4), productController.addProducts);

admin_route.post("/unlist-product", auth.isLogin, productController.unlistProduct);

admin_route.get("/edit-product", auth.isLogin, productController.loadEditProducts);

admin_route.post("/edit-product", upload.array("images", 4), productController.editProduct);

admin_route.post("/delete-image", productController.deleteImage);

admin_route.post("/add-images", upload.array("images", 4), productController.addImages);

//================================== C A T E G O R Y == S E C T I ON ================================================================================//

admin_route.get("/categories", auth.isLogin, categoryController.loadCatogories);

admin_route.get("/editCategories", auth.isLogin, categoryController.loadEditCatogories);

admin_route.post("/editCategories", categoryController.editCategory);

admin_route.get("/addCategories", auth.isLogin, categoryController.loadAddCategories);

admin_route.post("/addCategories", categoryController.addCategory);

admin_route.post("/unlist-category", auth.isLogin, categoryController.unlistCategory);

//=====================================================================================================================================//

admin_route.get("/banner", auth.isLogin, adminController.loadBanner);

admin_route.get("/orders", auth.isLogin, adminOrderController.loadOrder);

admin_route.get("/orderDetailss", adminOrderController.viewDetails);

admin_route.post("/updateProductStatus", adminOrderController.updateProductStatus);

admin_route.post("/updateReturnStatus", adminOrderController.updateReturnStatus);

admin_route.post("/refund", auth.isLogin, adminOrderController.proceedRefund);

//===================== C O U P O N - S E C T I O N  ======================================================================

admin_route.get("/coupons", auth.isLogin, couponController.loadCoupons);

admin_route.get("/addCoupons", auth.isLogin, couponController.loadAddCoupons);

admin_route.post("/addCoupons", couponController.addCoupon);

admin_route.get("/editCoupons", auth.isLogin, couponController.loadEditCoupon);

admin_route.post("/editCoupons", couponController.editCoupon);

admin_route.get("/delete-coupons", couponController.deleteCoupon);

//=====================================================================================================

admin_route.get("/sales", auth.isLogin, salesController.loadSales);

admin_route.get("/export-sales", auth.isLogin, salesController.exportReport);

admin_route.get("/get-sales-data", auth.isLogin, dashboardController.getSalesDataByDate);

admin_route.get("*", function (req, res) {
    res.redirect("/admin");
});

module.exports = admin_route;
