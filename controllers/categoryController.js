
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const paginate = require("../middleware/paginate");
const randomstring = require("randomstring");


////////---------Category Section  -----------====================

const loadCatogories = async (req, res) => {
  try {
      const categories = await Category.find(); // Assuming you want to retrieve all categories from the database
      res.render("categories", { Category: categories });
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
  }
};

//---------------Rendering Add category page---------======================

const loadAddCategories = async (req, res) => {
  try {
      res.render("addCategories");
  } catch (error) {
      console.log(error.message);
  }
};

//=================Adding Category-----=====================//

const addCategory = async (req, res) => {
    try {
      const categoryname = req.body.categoryname;
      const categorydes = req.body.categorydes;
      const discount = req.body.Offer;
  
      // Check if the category with the same name already exists
      const existingCategory = await Category.findOne({ categoryname: categoryname });
  
      if (existingCategory) {
        // Category with the same name already exists, send an error message
        return res.render("addCategories", { message: "Category with the same name already exists" });
      }
  
      // Create a new category
      const newCategory = new Category({
        categoryname: categoryname,
        description: categorydes,
        discountPercentage: discount,
        status: true,
      });
  
      const categoryData = await newCategory.save();
  
      if (categoryData) {
        // Category added successfully, redirect to the categories page
        res.redirect("/admin/categories");
      } else {
        // Error while adding category, show error message
        res.render("addCategories", { message: "Something went wrong" });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  };
  

///==============To unlist Category----=================================

const unlistCategory = async (req, res) => {
  try {
      const id = req.query.id;
      const category = await Category.findById(id);

      if (category) {
          category.status = !category.status;
          await category.save();
          return res.status(200).json({ message: "Category Status Updated" });
      } else {
        res.status(404).send("Category not found"); // Send a 404 error if product is not found
    }
  } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error"); // Send a 500 error for internal server errors
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
          res.render("editCategories", { data: category }); // Pass the category object to the template
      } else {
          res.redirect("/admin/categories");
      }
  } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
  }
};

///=============Editing Category==========///////////////////

const editCategory = async (req, res) => {
  try {

    const id = req.body.id;
    let category = await Category.findById(id)

    if(category){

       // Update product fields
       category.categoryname = req.body.categoryname;
       category.description = req.body.categorydes;
       category.discountPercentage = req.body.Offer;

        // Save the updated product
        const updatedCategory = await category.save();

        if (updatedCategory) {
            res.redirect("/admin/categories");
        } else {
            res.render("editCategories", { data: category, message: "Failed to update the category" });
        }
    }else {
      res.redirect("/admin/categories");
  }
  
  } catch (error) {
      console.log(error.message);
  }
};


module.exports = {

  loadCatogories,
  loadEditCatogories,
  editCategory,
  loadAddCategories,
  addCategory,
  unlistCategory,

};
