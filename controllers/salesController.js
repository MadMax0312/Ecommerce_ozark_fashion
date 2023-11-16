const Admin = require("../models/adminModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const { Parser } = require('json2csv');
const fs = require('fs');

const loadSales = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    const ordersWithFormattedDeliveryDate = orders.map((order) => {
      const orderDate = new Date(order.createdAt);
      const expectedDeliveryDate = new Date(orderDate);
      expectedDeliveryDate.setDate(orderDate.getDate() + 7);

      const formattedDeliveryDate = expectedDeliveryDate
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
        .replace(/\//g, "-");

      return {
        ...order.toObject(),
        formattedDeliveryDate: formattedDeliveryDate,
      };
    });

    // Get order summary statistics
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
    ]);

    const orderSummary = {
      totalOrders: orders.length,
      totalSales: totalSales.length > 0 ? totalSales[0].totalAmount : 0,
      averageOrderValue: orders.length > 0 ? totalSales[0].totalAmount / orders.length : 0,
    };

    res.render("sales", {
      orders: ordersWithFormattedDeliveryDate,
      orderSummary: orderSummary,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const exportReport = async (req, res) => {
  try {
    const { filter } = req.query;
    let filterMatch = {};

    // Add filtering based on the selected option (daily, weekly, monthly)
    if (filter === 'daily') {
      filterMatch = { createdAt: { $gte: new Date(new Date().setHours(0, 0, 0)), $lt: new Date(new Date().setHours(23, 59, 59)) } };
    } else if (filter === 'weekly') {
      filterMatch = { createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)), $lt: new Date() } };
    } else if (filter === 'monthly') {
      filterMatch = { createdAt: { $gte: new Date(new Date().setDate(1)), $lt: new Date(new Date().setMonth(new Date().getMonth() + 1) - 1) } };
    }

    const orders = await Order.find(filterMatch).sort({ createdAt: -1 });

    // Transform the data to the format needed for CSV
    const csvData = orders.map(order => ({
      'Order Id': order._id,
      'Order Date': order.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).replace(/\//g, '-'),
      'Amount': order.totalAmount,
      'Payment': order.paymentMethod,
      'Payment Status': order.paymentStatus,
      'Status': order.products[0].status,
    }));

    // Create CSV using json2csv library
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(csvData);

    // Set up response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sales-report.csv');

    // Pipe the CSV data to the response stream
    res.status(200).send(csv);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  loadSales,
  exportReport,
};
