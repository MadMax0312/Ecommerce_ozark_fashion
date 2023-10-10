const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");

const securePassword = async(password)=> {
  try {

    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;

  }catch(error){
    console.log(error.message);
  }
}

const loadLogin = async(req,res) =>{

  try{

    res.render('login')

  }catch(error){
    console.log(error.message);
  }
}

///////----------------------Verify Login-------------------'///////////

const verifyLogin = async(req,res) => {

  try {

    const email = req.body.email;
    const password = req.body.password;
    console.log(password)

    const adminData = await Admin.findOne({ email:email })
    console.log(adminData);
    if(adminData){
      console.log("helloo");

      const passwordMatch = await bcrypt.compare(password,adminData.password);

      if(passwordMatch){

        if(adminData.is_admin === 0){
          res.render('login',{message:"Login details are incorrect" });
        }else{
          req.session.admin_id = adminData._id;                 ///--------------Session Creating -----------///////////////////////////
          res.redirect('/admin/home');
        }

      }else{
        res.render('login',{message:"Login details are incorrect" });
      }

    }else {
      res.render('login',{message:"Login details are incorrect" });
    }

  }catch(error){
    console.log(error.message);
  }
}

//-----------------Rendering homePage-------------------------

const loadDashboard = async(req,res) => {

  try {
    const adminData = await Admin.findById({ _id:req.session.admin_id });
    res.render('home');

  }catch(error){
    console.log(error.message);
  }
}

///----------Loading user page in admin dashboard===========

const loadUsers = async(req,res) =>{

  try{

    res.render('users');

  }catch(error){
    console.log(error.message);
  }
}

const loadProducts = async(req,res) =>{

  try{

    res.render('products');

  }catch(error){
    console.log(error.message);
  }
}

const loadCatogories = async(req,res) =>{

  try{

    res.render('categories');

  }catch(error){
    console.log(error.message);
  }
}

const loadBanner = async(req,res) =>{

  try{

    res.render('banner');

  }catch(error){
    console.log(error.message);
  }
}

const loadCoupons = async(req,res) =>{

  try{

    res.render('coupons');

  }catch(error){
    console.log(error.message);
  }
}

const loadOrder = async(req,res) =>{

  try{

    res.render('orders');

  }catch(error){
    console.log(error.message);
  }
}

const loadSales = async(req,res) =>{

  try{

    res.render('sales');

  }catch(error){
    console.log(error.message);
  }
}


module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  loadUsers,
  loadProducts,
  loadCatogories,
  loadBanner,
  loadCoupons,
  loadOrder,
  loadSales
}
