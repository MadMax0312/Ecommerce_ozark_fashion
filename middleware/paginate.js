
const Product = require("../models/productModel");

const paginate = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    res.locals.pagination = {
      currentPage: page,
      totalPages: totalPages,
      nextPage: page < totalPages ? page + 1 : null, // Include next page in pagination data
      prevPage: page > 1 ? page - 1 : null // Include previous page in pagination data
    };

    req.pagination = {
      skip: skip,
      limit: limit
    };

    next();
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = paginate;
