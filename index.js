const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const config = require("./config/config");
require('dotenv').config();

mongoose.connect("mongodb://127.0.0.1:27017/Ozark_Fashion", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const express = require("express");
const app = express();

app.use(
    session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: true,
    })
);

app.use("/static", express.static(path.join(__dirname, "public")));

const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

//for admin routes-----------------------------///////////////////

const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);

app.use("*", (req, res) => {
    res.send("Error 404. No pages available");
});

app.listen(process.env.PORT || 8080, () => {
    console.log("Server is running....");
});
