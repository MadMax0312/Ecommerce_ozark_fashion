const mongoose = require("mongoose");
const path = require("path");

mongoose.connect("mongodb://127.0.0.1:27017/Ozark_Fashion");

const express = require("express")
const app = express();

app.use("/static",express.static(path.join(__dirname,'public')));

const userRoute = require("./routes/userRoute");
app.use('/',userRoute);

app.listen(process.env.PORT || 8080, () => {
  console.log("Server is running....");
})