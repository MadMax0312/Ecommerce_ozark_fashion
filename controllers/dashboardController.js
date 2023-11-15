const Admin = require("../models/adminModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

const Order = require("../models/orderModel");



const loadDashboard = async (req, res) => {
  try {
      // const adminData = await Admin.findById({ _id:req.session.admin_id });
      const userCount = await User.find().countDocuments();
      const blockCount = await User.find({isBlock:true}).countDocuments();
      const productCount = await Product.find().countDocuments();
      const orderCount = await Order.find().countDocuments();

       // Total Sales Amount
       const totalSales = await Order.aggregate([
        { $match: { paymentStatus: 'Paid' } }, // You may adjust the match criteria as needed
        { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } },
    ]);

    // Total Purchase Amount
    const totalPurchase = await Order.aggregate([
        { $match: { paymentStatus: 'Paid' } }, // You may adjust the match criteria as needed
        { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } },
    ]);

    // Total Products Sold
    const totalProductsSold = await Order.aggregate([
        { $match: { paymentStatus: 'Paid' } }, // You may adjust the match criteria as needed
        { $group: { _id: null, totalQuantity: { $sum: { $sum: '$products.quantity' } } } },
    ]);

    // Most Sold Product (assuming you have a field tracking product sales)
    const mostSoldProduct = await Order.aggregate([
        { $match: { paymentStatus: 'Paid' } }, // You may adjust the match criteria as needed
        { $unwind: '$products' },
        { $group: { _id: '$products.productId', totalQuantity: { $sum: '$products.quantity' } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 3 },
    ]);

    const mostSoldProductDetails = await Promise.all(
      mostSoldProduct.map(async (product) => {
          const productDetails = await Product.findById(product._id);
          return {
              ...product,
              name: productDetails ? productDetails.productname : null,
              description: productDetails ? productDetails.description : null,
              image: productDetails ? productDetails.image : null,
              price: productDetails ? productDetails.price : null,
              // Add other product details as needed
          };
      })
  );

    // Monthly Revenue
    const monthlyRevenue = await Order.aggregate([
        { $match: { createdAt: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) } } }, // Last 30 days
        { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } },
    ]);

    // Daily Revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Set the time to the beginning of the next day
    
    const dailyRevenue = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: today,
                    $lt: tomorrow,
                },
            },
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$totalAmount' },
            },
        },
    ]);
    

    // Yearly Revenue
    const yearlyRevenue = await Order.aggregate([
        { $match: { createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) } } }, // Current year
        { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } },
    ]);

    // Total Revenue
    const totalRevenue = await Order.aggregate([
        { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } },
    ]);

    const walletRevenue = await Order.aggregate([
        { $match: { paymentMethod: 'Wallet Transfer' } },
        { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } },
    ]);

    const cashOnDeliveryRevenue = await Order.aggregate([
        { $match: { paymentMethod: 'Cash on Delivery' } },
        { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } },
    ]);

    const RazorPayRevenue = await Order.aggregate([
        { $match: { paymentMethod: 'Razor Payment' } },
        { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } },
    ]);

    const orderData = await Order.find()
    .sort({ createdAt: -1 })
    .populate({
        path: "user",
    })
    .populate({
        path: "products.productId",
    })
    .limit(5)

    console.log(totalPurchase)
    console.log(totalProductsSold)
    console.log(totalSales)


    const orderSummary = {
        totalSales: totalSales.length > 0 ? totalSales[0].totalAmount : 0,
        totalPurchase: totalPurchase.length > 0 ? totalPurchase[0].totalAmount : 0,
        totalProductsSold: totalProductsSold.length > 0 ? totalProductsSold[0].totalQuantity : 0,
        mostSoldProduct: mostSoldProduct.length > 0 ? mostSoldProduct[0] : null,
        mostSoldProductDetails:mostSoldProductDetails,
        monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].totalAmount : 0,
        dailySales: dailyRevenue.length > 0 ? dailyRevenue[0].totalAmount : 0,
        yearlySales: yearlyRevenue.length > 0 ? yearlyRevenue[0].totalAmount : 0,
        totalOrder: totalRevenue.length > 0 ? totalRevenue[0].totalAmount : 0,
        totalRevenue: totalSales.length > 0 ? totalSales[0].totalAmount * 0.3 : 0,
        razorRevenue: RazorPayRevenue.length > 0 ? RazorPayRevenue[0].totalAmount : 0,
        walletRevenue: walletRevenue.length > 0 ? walletRevenue[0].totalAmount : 0,
        cashOnDeliveryRevenue: cashOnDeliveryRevenue.length > 0 ? cashOnDeliveryRevenue[0].totalAmount : 0,
        orderData:orderData,
    };

      res.render("home", {
        Ucount:userCount, 
        Pcount:productCount, 
        Bcount:blockCount, 
        Ocount:orderCount,
        order:orderSummary,
      }); 
  } catch (error) {
      console.log(error.message);
  }
};

module.exports = {
  loadDashboard
}