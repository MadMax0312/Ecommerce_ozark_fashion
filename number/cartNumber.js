const Cart = require("../models/cartModel")

const getTotalProductsInCart = async (userId) => {
  try {
      const userCart = await Cart.findOne({ user_id: userId });
      if (userCart && userCart.items.length > 0) {
          const uniqueProductIds = new Set(userCart.items.map(item => item.product.toString()));
          const totalProducts = uniqueProductIds.size;
          return totalProducts;
      } else {
          return 0;
      }
  } catch (error) {
      throw error;
  }
};

module.exports = {
  getTotalProductsInCart,
} 