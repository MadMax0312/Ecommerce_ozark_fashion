
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const fs = require('fs');
const Swal = require('sweetalert2');


const viewProducts = async (req, res) => {
  try {
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }

    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    const limit = 5;

    // Get the deleted images from the request or set it as an empty array

    const productData = await Product.find({
      $or: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" } },
        { size: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    })
      .populate("category")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();


    const count = await Product.find({
      $or: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" } },
        { size: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    }).countDocuments();

    const categories = await Category.find();

    res.render("products", {
      Product: productData,
      Category: categories,
// Pass deletedImages to the view
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};



const loadaddProducts = async (req, res) => {
  try {
      // Fetch categories from the database
      const categories = await Category.find();

      // Render the addProducts.ejs template with the Category variable
      res.render("addProducts", { Category: categories });
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
  }
};

const addProducts = async (req, res) => {
  try {
    console.log("Enterrrr");
    const productname = req.body.productname;
    const category = req.body.category;
    const size = req.body.size;
    const description = req.body.description;
    const price = req.body.price;
    const quantity = req.body.quantity;
   
    const images = [];

    for (let i = 0; i < req.files.length; i++) {
      images[i] = req.files[i].filename;
    }

    if (!productname || !size || !price || !quantity || !description) {
      // Return validation error response
      return res.status(400).json({ error: "All fields are required." });
    }

    console.log("kjhgffg");
    const newProduct = new Product({
      productname: productname,
      category: category,
      size: size,
      description: description,
      price: price,
      image: images,
      quantity: quantity,
      createdAt: Date.now(),
      status: true,
    });

    const productData = await newProduct.save();
    console.log(productData);

    if (productData) {
     
        res.redirect("/admin/view-products");
     
    } else {
    
        res.render("addProducts", { message: "Something went wrong" });
     
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

///--------------Unlisting products-----------------------------

const unlistProduct = async (req, res) => {
  try {
      const id = req.query.id;
      const product = await Product.findById(id);

      if (product) {
          product.status = !product.status;
          await product.save();
          return res.status(200).json({ message: "Product Status Updated" });
      } else {
          res.status(404).send("Product not found"); // Send a 404 error if product is not found
      }
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error"); // Send a 500 error for internal server errors
  }
};

///=====      Rendering edit products page   ============//

const loadEditProducts = async (req, res) => {
  try {
      const id = req.query.id;


      const product = await Product.findById(id)


      const categories = await Category.find();

      if (product) {
          res.render("editProducts", { data: product, Category: categories }); // Pass the category object to the template
      } else {
          res.redirect("/admin/products");
      }
  } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
  }
};

///==============Editing products=====================

const editProduct = async (req, res) => {
  try {
      const id = req.body.id;
      let product = await Product.findById(id);

      if (product) {
          // Update product fields
          product.productname = req.body.productname;
          product.category = req.body.category;
          product.description = req.body.description;
          product.price = req.body.price;
          product.quantity = req.body.quantity;
          product.size = req.body.size;

          // Handle new images
          if (req.files && req.files.length > 0) {
              // Clear existing images if there are new images
              product.image = [];
              for (let i = 0; i < req.files.length; i++) {
                  product.image.push(req.files[i].filename);
              }
          }

          // Save the updated product
          const updatedProduct = await product.save();

          if (updatedProduct) {
              res.redirect("/admin/view-products");
          } else {
              res.render("edit-product", { data: product, message: "Failed to update the product" });
          }
      } else {
          res.redirect("/admin/view-products");
      }
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
  }
};


const deleteImage = async (req, res) => {
  try {
      const imageName = req.query.imageName;
      const productId = req.query.productId;
      console.log(productId);


          try {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).send('Product not found.');
            }
    
            // Check if the image belongs to the product
            if (!product.image.includes(imageName)) {
                return res.status(404).send('Image not found in the product.');
            }
    
            // Remove the image from the product's image array
            product.image.pull(imageName);
    
            // Save the updated product
            await product.save();

              console.log(product);

              if (product) {
                  return res.status(200).send('Image deleted successfully.');
              } else {
                  return res.status(404).send('Product not found.');
              }
          } catch (error) {
              console.error(error);
              return res.status(500).send('Internal server error.');
          }
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateImage = async(req, res) => {
  try {
    const existingImageName  = req.body.existingImageName;
    const newImage = req.query.imageName;
    console.log(newImage);
    console.log(existingImageName);

    // Update the image in the database based on the existing image name
    const updatedProduct = await Product.findOneAndUpdate(
        { image: existingImageName },
        { $set: { "image.$": newImage } },
        { new: true }
    );

    console.log(updatedProduct);

    if (updatedProduct) {
        res.status(200).send('Image updated successfully.');
    } else {
        res.status(404).send('Product not found.');
    }
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
}
}

const addImages = async (req, res) => {
  try {
      const productId = req.body.productId;
      const images = req.files.map(file => file.filename);

      // Find the product by ID and push new images to the product's image array
      const product = await Product.findByIdAndUpdate(productId, {
          $push: { image: images }
      }, { new: true });

      if (product) {
          res.status(200).json({ images }); // Send the added image filenames in the response
      } else {
          res.status(404).send('Product not found.');
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error.');
  }
};





module.exports = {

  viewProducts,
  loadaddProducts,
  addProducts,
  unlistProduct,
  editProduct,
  deleteImage,
  updateImage,
  addImages, 
  loadEditProducts,

};
