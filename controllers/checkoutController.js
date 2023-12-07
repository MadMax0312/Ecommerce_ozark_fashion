const User = require("../models/userModel");
const { getTotalProductsInCart } = require("../number/cartNumber");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");

const calculateDiscountedPrice = (product, quantity) => {
    const productPrice = product.price;

    // Calculate product-level discount
    const productDiscountPercentage = parseFloat(product.discountPercentage) || 0;
    const productDiscountedPrice = productPrice - (productPrice * productDiscountPercentage) / 100;

    // Calculate category-level discount
    const category = product.category || {};
    const categoryDiscountPercentage = parseFloat(category.discountPercentage) || 0;
    const categoryDiscountedPrice = productPrice - (productPrice * categoryDiscountPercentage) / 100;

    // Use the minimum of product and category discounts
    const finalDiscountedPrice = Math.min(productDiscountedPrice, categoryDiscountedPrice);

    return {
        productDiscountedPrice: productDiscountedPrice,
        categoryDiscountedPrice: categoryDiscountedPrice,
        finalDiscountedPrice: finalDiscountedPrice,
    };
};

const loadCheckout = async (req, res, next) => {
    try {
        const userId = req.session.user_id;
        const userData = await User.findById({ _id: userId });
        const userAddress = await Address.findOne({ userId });
        const totalProductsInCart = await getTotalProductsInCart(userId);

        if (!userId) {
            return res.status(401).json({ message: "Please log in to continue." });
        }

        if (totalProductsInCart == 0) {
            return res.status(402).json({ message: "Please add items to the cart." });
        }

        const cartData = await Cart.findOne({ user_id: userId }).populate({
            path: "items.product",
            model: "Product",
            populate: "category",
        });

        const couponData = await Coupon.find().sort({ minimumPurchase: 1 });

        // Calculate discounted prices for each product in the cart
        cartData.items.forEach((item) => {
            const { finalDiscountedPrice } = calculateDiscountedPrice(item.product, item.quantity);
            item.product.finalDiscountedPrice = finalDiscountedPrice;
        });

        // Calculate the total amount after discounts
        const totalAmountAfterDiscounts = cartData.items.reduce((total, item) => {
            return total + item.product.finalDiscountedPrice * item.quantity;
        }, 0);

        res.render("checkout", {
            user: userData,
            address: userAddress,
            cart: cartData,
            totalAmount: totalAmountAfterDiscounts,
            count: totalProductsInCart,
            coupon: couponData,
        });
    } catch (error) {
        next(error);
    }
};

const getAddressById = async (req, res, next) => {
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
        next(error);
    }
};

const updateAddress = async (req, res, next) => {
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
            { new: true }
        );

        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
};

const addAddress = async (req, res, next) => {
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
        next(error);
    }
};

const applyCoupon = async (req, res, next) => {
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

        // Check if the coupon is expired
        const currentDate = new Date();
        if (coupon.expirationDate && currentDate > coupon.expirationDate) {
            return res.json({ success: false, error: "Coupon has expired" });
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
    } catch (error) {
        next(error);
    }
};

module.exports = {
    loadCheckout,
    getAddressById,
    updateAddress,
    addAddress,
    applyCoupon,
};
