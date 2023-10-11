const Admin = require("../models/adminModel");
const Category = require("../models/categoryModel");
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
    // const adminData = await Admin.findById({ _id:req.session.admin_id });
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

////===========Products Section -----===========\\\\\\\\\\\\\

const loadProducts = async(req,res) =>{

  try{

    res.render('products');

  }catch(error){
    console.log(error.message);
  }
}

////////---------Category Section  -----------====================

const loadCatogories = async (req, res) => {
  try {
    const categories = await Category.find(); // Assuming you want to retrieve all categories from the database
    res.render('categories', { Category: categories });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

//---------------Rendering Add category page---------======================

const loadAddCategories = async(req,res) =>{

  try{

    res.render('addCategories');

  }catch(error){
    console.log(error.message);
  }
}

//=================Adding Category-----=====================//

const addCategory = async(req,res) => {

  try{

    const categoryname = req.body.categoryname;
    const categorydes = req.body.categorydes;
   
    const data = new Category({
      categoryname:categoryname,
      description:categorydes,
      status:true
    });

    console.log(data);

    const categoryData = await data.save();

    if(categoryData){
      res.redirect('/admin/categories');

    }else{
      res.render('addCategories',{message:"Something went wrong"});
    }

  }catch(error){
    console.log(error.message);
  }
}

// const unlistCategory= async(req,res) => {
//   try {

//     const id = req.query.id;
//     console.log(id);
//     const data = await Category.findOne({ _id:id });
//     console.log(data)
//     if(data.status===true){
//       data.status=false
//     }else{
//       data.status=true
//     }
//     console.log(data)

//     // const categories = await Category.find()

//     res.render('categories', { Category: data });
    

//   }catch(error){
//     console.log(error.message);
//   }
// }

///==============To unlist Category----=================================

const unlistCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const category = await Category.findById(id);

    if (category) {
      category.status = !category.status;
      await category.save();
    }

    const categories = await Category.find();
    res.render('categories', { Category: categories });
  } catch (error) {
    console.log(error.message);
  }
};

//==============Rendering Edit Category Page--------=========================

const loadEditCatogories = async (req, res) => {
  try {
    const id = req.query.id;
    console.log("ID:", id);

    const category = await Category.findById(id);
    console.log(category);

    if (category) {
      res.render('editCategories', { data: category }); // Pass the category object to the template
    } else {
      res.redirect('/admin/categories');
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
}

///=============Editing Category==========///////////////////

const editCategory = async(req,res) => {

  try{

    const editData = await Category.findByIdAndUpdate({ _id:req.body.id },{$set:{ categoryname:req.body.categoryname, description:req.body.categorydes }});

    res.redirect('/admin/categories');

  }catch(error){
    console.log(error.message);
  }
}

//////===========Banner Section ===================///////////////// 

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
  loadEditCatogories,
  editCategory,
  loadAddCategories,
  addCategory,
  unlistCategory,
  loadBanner,
  loadCoupons,
  loadOrder,
  loadSales
}


