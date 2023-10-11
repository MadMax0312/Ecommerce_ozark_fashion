const Admin = require("../models/adminModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
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

const viewProducts = async(req,res) =>{

  try {
    const products = await Product.find().populate("category"); // Populate the category field
    const categories = await Category.find(); // Assuming you want to retrieve all categories from the database
    res.render('products', { Product: products, Category: categories });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

const loadaddProducts = async (req, res) => {
  try {
    // Fetch categories from the database
    const categories = await Category.find();

    // Render the addProducts.ejs template with the Category variable
    res.render('addProducts', { Category: categories });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const addProducts = async(req,res) =>{

  try{

    const productname = req.body.productname;
    const category = req.body.category;
    const size = req.body.size
    const description = req.body.description;
    const price = req.body.price;
    const quantity = req.body.quantity;
    const image = req.file.filename;

    console.log("kjhgffg");
    const newProduct = new Product({
      productname:productname,
      category:category,
      size:size,
      description:description,
      price:price,
      // color,
      image:image,
      quantity:quantity,
      status:true
    });
    const productData = await newProduct.save();
    console.log(productData);
    if(productData){
      res.redirect('/admin/view-products');
    }else{
      res.render('addProducts',{message:"Something went wrong"});
    }

  }catch(error){
    console.error(error);
    res.status(500).send('Internal Server Error');
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

const unlistProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findById(id);

    if (product) {
      product.status = !product.status;
      await product.save();
    }

    const products = await Product.find();
    res.render('products', { Product: products });
  } catch (error) {
    console.log(error.message);
  }
};

const loadEditProducts = async (req, res) => {
  try {
    const id = req.query.id;
    console.log("ID:", id);

    const product = await Product.findById(id);
    console.log(product);

    if (product) {
      res.render('editProducts', { data: product }); // Pass the category object to the template
    } else {
      res.redirect('/admin/products');
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
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
  viewProducts,
  loadaddProducts,
  addProducts,
  unlistProduct,
  loadEditProducts,
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


