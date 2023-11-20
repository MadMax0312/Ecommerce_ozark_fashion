const User = require("../models/userModel");
const { getTotalProductsInCart } = require("../number/cartNumber");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");

const loadCheckout = async (req, res) => {
    try {
        const userId = req.session.user_id;

        const totalProductsInCart = await getTotalProductsInCart(userId);

        if (!userId) {
            return res.status(401).json({ message: "Please log in to continue." });
        }

        if (totalProductsInCart == 0) {
            return res.status(402).json({ message: "Please add items in cart" });
        }

        const userData = await User.findById({ _id: userId });
        const userAddress = await Address.findOne({ userId });
        const cartData = await Cart.findOne({ user_id: userId }).populate("items.product");
        const couponData = await Coupon.find().sort({ minimumPurchase:1 })

        const totalAmount = cartData.items.reduce((total, item) => {
            return total + item.product.price * item.quantity;
        }, 0);

        res.render("checkout", {
            user: userData,
            address: userAddress,
            cart: cartData,
            totalAmount,
            count: totalProductsInCart,
            coupon: couponData,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const getAddressById = async (req, res) => {
    try {
        const addressId = req.params.id;
        const userId = req.session.user_id;
        let userAddress = await Address.findOne({ userId: userId }, { address: { $elemMatch: { _id: addressId } } });

        const address = userAddress.address[0];

        if (!address) {
            return res.status(404).json({ error: "Address not found" });
        }
        res.status(200).json(address);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const updateAddress = async (req, res) => {
    const addressId = req.params.id;

    const updatedAddress = req.body;

    try {
        const user_id = req.session.user_id;

        const updated = await Address.findOneAndUpdate(
            { userId: user_id, "address._id": addressId },
            {
                $set: {
                    "address.$.fullName": updatedAddress.fullName,
                    "address.$.pincode": updatedAddress.pincode,
                    "address.$.city": updatedAddress.city,
                    "address.$.mobile": updatedAddress.mobile,
                    "address.$.state": updatedAddress.state,
                    "address.$.district": updatedAddress.district,
                },
            },
            { new: true } // { new: true } ensures the updated document is returned
        );

        res.status(200).json(updated);
    } catch (error) {
        console.error("Error updating address:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const addAddress = async (req, res) => {
    try {
        const { c_diff_fname, c_diff_mobile, c_diff_postal_state, c_diff_state_district, c_diff_city, c_diff_pincode } =
            req.body;

        let userAddress = await Address.findOne({ userId: req.session.user_id });
        if (!userAddress) {
            userAddress = new Address({
                userId: req.session.user_id,
                address: [
                    {
                        fullName: c_diff_fname,
                        mobile: c_diff_mobile,
                        state: c_diff_postal_state,
                        district: c_diff_state_district,
                        city: c_diff_city,
                        pincode: c_diff_pincode,
                    },
                ],
            });
        } else {
            userAddress.address.push({
                fullName: c_diff_fname,
                mobile: c_diff_mobile,
                state: c_diff_postal_state,
                district: c_diff_state_district,
                city: c_diff_city,
                pincode: c_diff_pincode,
            });
        }

        await userAddress.save();

        res.json({ message: "Address added successfully" });
    } catch (error) {
        console.error("Error adding address:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const applyCoupon = async (req, res) => {
    try {
        const { couponName } = req.body;
        const userId = req.session.user_id;

        const cartData = await Cart.findOne({ user_id: userId }).populate("items.product");

        const totalAmount = cartData.items.reduce((total, item) => {
            return total + item.product.price * item.quantity;
        }, 0);

        const coupon = await Coupon.findOne({ couponName });

        if (!coupon) {
            return res.json({ success: false, error: "Invalid coupon code" });
        }

        if (totalAmount < coupon.minimumPurchase) {
            return res.json({ success: false, error: "Coupon can only be applied for orders above a certain amount" });
        }

        const userHasUsedCoupon = coupon.users.includes(userId);
        if (userHasUsedCoupon) {
            return res.json({ success: false, error: "You have already used this coupon" });
        }

        const discount = Math.min((coupon.discountPercentage / 100) * totalAmount, coupon.maximumDiscount);
        const totalAmountAfterDiscount = totalAmount - discount; 

        res.json({
            success: true,
            discount: discount,
            totalAmount: totalAmountAfterDiscount, 
        });

        coupon.users.push(userId);
        await coupon.save();
    } catch (error) {
        console.error("Error applying coupon:", error.message);
        res.json({ success: false, error: "Internal server error" });
    }
};

module.exports = {
    loadCheckout,
    getAddressById,
    updateAddress,
    addAddress,
    applyCoupon
};
