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

admin_route.get('/',auth.isLogout,adminController.loadLogin);

admin_route.post('/',adminController.verifyLogin);

admin_route.get('/home',adminController.loadDashboard);

module.exports = admin_route;