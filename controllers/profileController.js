const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const { getTotalProductsInCart } = require("../number/cartNumber");

// ========== rendering user profile ===========
const loadProfile = async (req, res, next) => {
    try {
        const id = req.session.user_id;
        const userData = await User.findById({ _id: id }).populate("walletHistory");
        const userAddress = await Address.findOne({ userId: id });
        const totalProductsInCart = await getTotalProductsInCart(id);

        res.render("userProfile", { user: userData, address: userAddress, count: totalProductsInCart });
    } catch (error) {
        next(error);
    }
};

// ========= rendering user address page ==========
const loadAddress = async (req, res, next) => {
    try {
        const userId = req.session.user_id;
        const totalProductsInCart = await getTotalProductsInCart(userId);

        res.render("address", { user: userId, count: totalProductsInCart });
    } catch (error) {
        next(error);
    }
};

// =========== adding user address =========
const addAddress = async (req, res, next) => {
    try {
        let userAddress = await Address.findOne({ userId: req.session.user_id });
        if (!userAddress) {
            userAddress = new Address({
                userId: req.session.user_id,
                address: [
                    {
                        fullName: req.body.fullName,
                        mobile: req.body.mobile,
                        state: req.body.state,
                        district: req.body.district,
                        city: req.body.city,
                        pincode: req.body.pincode,
                    },
                ],
            });
        } else {
            userAddress.address.push({
                fullName: req.body.fullName,
                mobile: req.body.mobile,
                state: req.body.state,
                district: req.body.district,
                city: req.body.city,
                pincode: req.body.pincode,
            });
        }

        let result = await userAddress.save();

        res.redirect("/userProfile");
    } catch (error) {
        next(error);
    }
};

// ========== here user cand edit address =======
const loadEditAddress = async (req, res, next) => {
    try {
        const id = req.query.id;
        const userId = req.session.user_id;
        const totalProductsInCart = await getTotalProductsInCart(id);

        let userAddress = await Address.findOne({ userId: userId }, { address: { $elemMatch: { _id: id } } });

        const address = userAddress.address;

        res.render("editAddress", { user: userId, addresses: address[0], count: totalProductsInCart });
    } catch (error) {
        next(error);
    }
};

// ========== edit user address ==========
const editAddress = async (req, res, next) => {
    try {
        const user_id = req.session.user_id;
        const addressId = req.body.id;

        const details = await Address.updateOne(
            { userId: user_id, "address._id": addressId },
            {
                $set: {
                    "address.$.fullName": req.body.fullName,
                    "address.$.pincode": req.body.pincode,
                    "address.$.city": req.body.city,
                    "address.$.mobile": req.body.mobile,
                    "address.$.state": req.body.state,
                    "address.$.district": req.body.district,
                },
            }
        );
        res.redirect("/userProfile");
    } catch (error) {
        next(error);
    }
};

// ============ deleting user address =========
const deleteAddress = async (req, res, next) => {
    try {
        let userAddress = await Address.findOne({ userId: req.session.user_id });
        const addressToDeleteIndex = userAddress.address.findIndex((address) => address.id === req.body.id);
        if (addressToDeleteIndex === -1) {
            return res.status(404).json({ remove: 0 });
        }
        userAddress.address.splice(addressToDeleteIndex, 1);
        await userAddress.save();
        return res.json({ remove: 1 });
    } catch (error) {
        next(error);
    }
};

// ======== updating user detailesl =========
const updateUser = async (req, res, next) => {
    try {
        const user_id = req.session.user_id;

        const details = await User.updateOne(
            { _id: user_id },
            {
                $set: {
                    firstName: req.body.Fname,
                    lastName: req.body.Lname,
                    email: req.body.email,
                    mobile: req.body.mobile,
                },
            },
            {
                new: true,
            }
        );

        res.redirect("/userProfile");
    } catch (error) {
        next(error);
    }
};

// ======== updating user detailesl =========
const resetPassword = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ _id: req.session.user_id });

        bcrypt.compare(req.body.oldPassword, userDetails.password).then(async (status) => {
            if (status) {
                const newSecurePassword = await bcrypt.hash(req.body.newPassword, 10);

                const change = await User.updateOne({ _id: userDetails._id }, { $set: { password: newSecurePassword } });
                res.redirect("/userProfile");
            } else {
                res.redirect("/userProfile");
            }
        });
    } catch (error) {
        next(error);
    }
};

//=======================================================

const loadOrderPage = async (req, res, next) => {
    try {
        const userId = req.session.user_id;
        const cart = await Cart.findOne({ user_id: userId });
        const userData = await User.findById({ _id: userId });
        const totalProductsInCart = await getTotalProductsInCart(userId);

        const page = parseInt(req.query.page) || 1;
        const limit = 7;
        const skip = (page - 1) * limit;

        const orderData = await Order.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);

        const totalOrders = await Order.countDocuments({ user: userId });

        const totalPages = Math.ceil(totalOrders / limit);

        // Modify orderData to include formatted delivery date for each order
        const ordersWithFormattedDeliveryDate = orderData.map((order) => {
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

        res.render("viewOrders", {
            user: userData,
            orders: ordersWithFormattedDeliveryDate, // Use the modified orderData array
            count: totalProductsInCart,
            totalPages: totalPages,
            currentPage: page,
        });
    } catch (error) {
        next(error);
    }
};

const viewDetails = async (req, res, next) => {
    try {
        const userId = req.session.user_id;
        const orderId = req.query.id;
        const totalProductsInCart = await getTotalProductsInCart(userId);
        const userData = await User.findById({ _id: userId });

        const latestOrder = await Order.findById({ _id: orderId })
            .populate({
                path: "products.productId",
            })
            .sort({ createdAt: -1 });

        if (!latestOrder) {
            return res.status(404).json({
                success: false,
                message: "No orders found for the user.",
            });
        }

        res.render("order", {
            user: userId,
            userData: userData,
            count: totalProductsInCart,
            data: [latestOrder],
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    loadProfile,
    loadAddress,
    addAddress,
    loadEditAddress,
    editAddress,
    deleteAddress,
    updateUser,
    resetPassword,
    loadOrderPage,
    viewDetails,
};
