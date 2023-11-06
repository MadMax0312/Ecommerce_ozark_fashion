const User = require("../models/userModel");
const { getTotalProductsInCart } = require("../number/cartNumber");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModel");

const loadCheckout = async (req, res) => {
    try {
        const userId = req.session.user_id;

        if (!userId) {
            return res.status(401).json({ message: "Please log in to continue." });
        }
      
        const userData = await User.findById({ _id: userId });
        const userAddress = await Address.findOne({ userId });
        const cartData = await Cart.findOne({ user_id: userId }).populate("items.product");
        const totalProductsInCart = await getTotalProductsInCart(userId);

        const totalAmount = cartData.items.reduce((total, item) => {
            return total + item.product.price * item.quantity;
        }, 0);
      
            res.render("checkout", { user: userData, address: userAddress, cart: cartData, totalAmount, count: totalProductsInCart });
        
        
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

module.exports = {
    loadCheckout,
    getAddressById,
    updateAddress,
    addAddress,
};
