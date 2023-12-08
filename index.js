const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const config = require("./config/config");
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const adminRoute = require("./routes/adminRoute");
const userRoute = require("./routes/userRoute");
const passport = require('passport');

mongoose.connect(process.env.MONGO_URL)

const app = express();
app.use(cors());

app.use(
    session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.set("views", "./views/users");

const disable = (req, res, next) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "1");
    next();
};
app.use(disable);

app.use("/static", express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoute);

app.use("/", userRoute);

app.use('*',(req,res)=>{
    res.render('404')
})

app.listen(process.env.PORT || 8080, () => {
    console.log("Server is running....");
});
