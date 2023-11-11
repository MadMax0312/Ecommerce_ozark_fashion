const Admin = require("../models/adminModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const path = require("path");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");

const loadOrder = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });

        // Modify orderData to include formatted delivery date for each order
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
                ...order.toObject(), // Convert Mongoose document to plain JavaScript object
                formattedDeliveryDate: formattedDeliveryDate,
            };
        });

        res.render("orders", {
            orders: ordersWithFormattedDeliveryDate,
        });
    } catch (error) {
        console.log(error.message);
    }
};

const viewDetails = async (req, res) => {
  try {
      const orderId = req.query.id;
      const latestOrder = await Order.findById({ _id: orderId })
          .populate({
              path: "address",
          })
          .populate({
              path: "products.productId",
          });

      res.render("orderInfo", {
          order: latestOrder,
      });
  } catch (error) {
      console.log(error.message);
  }
};

const updateProductStatus = async (req, res) => {
    try {
        const orderId = req.body.orderId;
        const productId = req.body.productId;
        const productStatus = req.body.productStatus;

        // Update product status
        const order = await Order.findOneAndUpdate(
            { 
                _id: orderId,
                'products._id': productId 
            },
            {
                $set: {
                    'products.$.status': productStatus
                }
            },
            { new: true }
        ).populate('products.productId');

       
        console.log("11111111",order)

        const updatedOrder = await Order.findById(orderId);

        console.log("222222222222222",updatedOrder)



        // Update payment status if all products are delivered
        if (productStatus === 'Delivered') {
            await Order.findByIdAndUpdate(
                orderId,
                {
                    $set: {
                        paymentStatus: 'Paid'
                    }
                },
                { new: true }
            );
        }

        res.json({ order });
    } catch (error) {
        console.error('Error updating product status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};





module.exports = {
    loadOrder,
    viewDetails,
    updateProductStatus,
};
