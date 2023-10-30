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

const adminController = require("../controllers/adminController");

admin_route.get("/", auth.isLogout, adminController.loadLogin);

admin_route.post("/", adminController.verifyLogin);

admin_route.get("/logout", auth.isLogin, adminController.loadLogout);

admin_route.get("/home", auth.isLogin, adminController.loadDashboard);

admin_route.get("/users", auth.isLogin, adminController.loadUsers);

admin_route.post("/block-user", auth.isLogin, adminController.blockUsers);

admin_route.get("/view-products", auth.isLogin, adminController.viewProducts);

admin_route.get("/add-products", adminController.loadaddProducts);

admin_route.post("/add-products", upload.array("images", 4), adminController.addProducts);

admin_route.post("/unlist-product", auth.isLogin, adminController.unlistProduct);

admin_route.get("/edit-product", auth.isLogin, adminController.loadEditProducts);

admin_route.post("/edit-product", upload.array("images", 4), adminController.editProduct);

admin_route.get("/categories", auth.isLogin, adminController.loadCatogories);

admin_route.get("/editCategories", auth.isLogin, adminController.loadEditCatogories);

admin_route.post("/editCategories", adminController.editCategory);

admin_route.get("/addCategories", auth.isLogin, adminController.loadAddCategories);

admin_route.post("/addCategories", adminController.addCategory);

admin_route.get("/unlist-category", auth.isLogin, adminController.unlistCategory);

admin_route.get("/banner", auth.isLogin, adminController.loadBanner);

admin_route.get("/coupons", auth.isLogin, adminController.loadCoupons);

admin_route.get("/orders", auth.isLogin, adminController.loadOrder);

admin_route.get("/sales", auth.isLogin, adminController.loadSales);

admin_route.get("*", function (req, res) {
    res.redirect("/admin");
});

module.exports = admin_route;
