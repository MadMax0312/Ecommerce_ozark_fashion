const Category = require("../models/categoryModel");

////////---------Category Section  -----------====================

const loadCatogories = async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.render("categories", { Category: categories });
    } catch (error) {
        next(error);
    }
};

//---------------Rendering Add category page---------======================

const loadAddCategories = async (req, res, next) => {
    try {
        res.render("addCategories");
    } catch (error) {
        next(error);
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

const unlistCategory = async (req, res, next) => {
    try {
        const id = req.query.id;
        const category = await Category.findById(id);

        if (category) {
            category.status = !category.status;
            await category.save();
            return res.status(200).json({ message: "Category Status Updated" });
        }
    } catch (error) {
        next(error);
    }
};

//==============Rendering Edit Category Page--------=========================

const loadEditCatogories = async (req, res, next) => {
    try {
        const id = req.query.id;
        console.log("ID:", id);

        const category = await Category.findById(id);
        console.log(category);

        if (category) {
            res.render("editCategories", { data: category });
        } else {
            res.redirect("/admin/categories");
        }
    } catch (error) {
        next(error);
    }
};

///=============Editing Category==========///////////////////

const editCategory = async (req, res, next) => {
    try {
        const id = req.body.id;
        let category = await Category.findById(id);

        if (category) {
            category.categoryname = req.body.categoryname;
            category.description = req.body.categorydes;
            category.discountPercentage = req.body.Offer;

            const updatedCategory = await category.save();

            if (updatedCategory) {
                res.redirect("/admin/categories");
            } else {
                res.render("editCategories", { data: category, message: "Failed to update the category" });
            }
        } else {
            res.redirect("/admin/categories");
        }
    } catch (error) {
        next(error);
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
