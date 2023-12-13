const Order = require("../models/orderModel");
const { Parser } = require("json2csv");

const loadSales = async (req, res, next) => {
    try {
        const productSales = await Order.aggregate([
     
            { $unwind: "$products" },
            {
                $lookup: {
                    from: "products", // Name of the Product model collection
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "product",
                },
            },
            {
                $unwind: "$product",
            },
    
            {
                $group: {
                    _id: {
                        productId: "$products.productId",
                        orderTrackId: "$orderTrackId",
                    },
                    productName: { $first: "$product.productname" },
                    orderedQuantity: { $sum: "$products.quantity" },
                    total: { $sum: "$products.subtotal" },
                    paymentMethod: { $first: "$paymentMethod" },
                    paymentStatus: { $first: "$products.paymentStatus" },
                    status: { $first: "$products.status" },
                    orderedDate: { $first: "$createdAt" },
                },
            },
            {
                $sort: { orderedDate: -1 }, // Sort by createdAt in descending order
            },
            {
                $project: {
                    _id: 0,
                    orderTrackId: "$_id.orderTrackId",
                    productId: "$_id.productId",
                    productName: 1,
                    orderedQuantity: 1,
                    total: 1,
                    paymentMethod: 1,
                    paymentStatus: 1,
                    status: 1,
                    orderedDate: 1,
                },
            },
        ]);

        res.render("sales", {
            productSales: productSales,
        });
    } catch (error) {
        next(error);
    }
};


const exportReport = async (req, res, next) => {
    try {
        const { filter } = req.query;
        let filterMatch = {};

        // Add filtering based on the selected option (daily, weekly, monthly)
        if (filter === "daily") {
            filterMatch = {
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0)), $lt: new Date(new Date().setHours(23, 59, 59)) },
            };
        } else if (filter === "weekly") {
            filterMatch = { createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)), $lt: new Date() } };
        } else if (filter === "monthly") {
            filterMatch = {
                createdAt: {
                    $gte: new Date(new Date().setDate(1)),
                    $lt: new Date(new Date().setMonth(new Date().getMonth() + 1) - 1),
                },
            };
        }

        const orders = await Order.find(filterMatch).sort({ createdAt: -1 });

        // Transform the data to the format needed for CSV
        const csvData = orders.map((order) => ({
            "Order Id": order.orderTrackId,
            "Order Date": order.createdAt
                .toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
                .replace(/\//g, "-"),
            Amount: order.totalAmount,
            Payment: order.paymentMethod,
            "Payment Status": order.paymentStatus,
            Status: order.products[0].status,
        }));

        // Create CSV using json2csv library
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(csvData);

        // Set up response headers for file download
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=sales-report.csv");

        // Pipe the CSV data to the response stream
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    loadSales,
    exportReport,
};
