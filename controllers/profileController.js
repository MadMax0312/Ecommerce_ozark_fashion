const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Address = require("../models/addressModel");
const { ObjectId } = require("mongodb");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const { getTotalProductsInCart } = require("../number/cartNumber");

// ========== rendering user profile ===========
const loadProfile = async (req, res) => {
    try {
        const id = req.session.user_id;
        const userData = await User.findById({ _id: id }).populate('walletHistory');
        const userAddress = await Address.findOne({ userId: id });
        const count = await Cart.find().countDocuments();

        res.render("userProfile", { user: userData, address: userAddress, count: count });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};


// ========= rendering user address page ==========
const loadAddress = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const count = await Cart.find().countDocuments();

        res.render("address", { user: userId, count: count });
    } catch (error) {
        console.log(error);
    }
};

// =========== adding user address =========
const addAddress = async (req, res) => {
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
        console.log(error.message);
    }
};

// ========== here user cand edit address =======
const loadEditAddress = async (req, res) => {
    try {
        const id = req.query.id;
        const userId = req.session.user_id;
        const count = await Cart.find().countDocuments();

        let userAddress = await Address.findOne({ userId: userId }, { address: { $elemMatch: { _id: id } } });

        const address = userAddress.address;

        res.render("editAddress", { user: userId, addresses: address[0], count: count });
    } catch (error) {
        console.log(error);
    }
};

// ========== edit user address ==========
const editAddress = async (req, res) => {
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
        console.log(error);
    }
};

// ============ deleting user address =========
const deleteAddress = async (req, res) => {
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
        console.log(error.message);
    }
};

// ======== updating user detailesl =========
const updateUser = async (req, res) => {
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
        console.log(error);
    }
};

// ======== updating user detailesl =========
const resetPassword = async (req, res) => {
    try {
        const userDetails = await User.findOne({ _id: req.session.user_id });

        bcrypt.compare(req.body.oldPassword, userDetails.password).then(async (status) => {
            if (status) {
                const newSecurePassword = await bcrypt.hash(req.body.newPassword, 10);

                const change = await User.updateOne({ _id: userDetails._id }, { $set: { password: newSecurePassword } });
                console.log(change);
                res.redirect("/userProfile");
                console.log("password changed...");
            } else {
                console.log("wrong old password");
                res.redirect("/userProfile");
            }
        });
    } catch (error) {
        console.log(error);
    }
};

//=======================================================

const loadOrderPage = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const cart = await Cart.findOne({ user_id: userId });
        const userData = await User.findById({ _id: userId });
        const totalProductsInCart = await getTotalProductsInCart(userId);

        const orderData = await Order.find({ user: userId }).sort({ createdAt: -1 });

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
        });
    } catch (error) {
        console.log(error);
    }
};

const viewDetails = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const totalProductsInCart = await getTotalProductsInCart(userId);
        const userData = await User.findById({ _id: userId });

        const orderId = req.query.id;

        const latestOrder = await Order.findById({ _id: orderId })
            .populate({
                path: "address",
            })
            .populate({
                path: "products.productId",
            });

        res.render("order", {
            user: userId,
            userData: userData,
            count: totalProductsInCart,
            data: [latestOrder],
        });
    } catch (error) {
        console.log(error.message);
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
