const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const config = require("./config/config");
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const adminRoute = require("./routes/adminRoute");
const userRoute = require("./routes/userRoute");

mongoose.connect("mongodb+srv://thahirmuhammedap:rUAxPc9lbK8Rfsy4@clusterozark.x3veijw.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(console.log("dfdf"));

const app = express();
app.use(cors());

app.use(
    session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: true,
    })
);

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
