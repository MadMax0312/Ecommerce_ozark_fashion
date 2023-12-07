const Coupon = require("../models/couponModel");

const loadCoupons = async (req, res, next) => {
    try {
        const couponData = await Coupon.find();

        res.render("coupons", { data: couponData });
    } catch (error) {
        next(error);
    }
};

const loadAddCoupons = async (req, res, next) => {
    try {
        res.render("addCoupons");
    } catch (error) {
        next(error);
    }
};

const addCoupon = async (req, res, next) => {
    try {
        const name = req.body.couponName;
        const discountPercentage = req.body.discount;
        const minimumPurchase = req.body.minPurchase;
        const startDate = req.body.startDate;
        const expiryDate = req.body.expiryDate;
        const users = req.body.users || [];

        const newCoupon = await Coupon({
            couponName: name,
            minimumPurchase: minimumPurchase,
            discountPercentage: discountPercentage,
            expiryDate: expiryDate,
            startingDate: startDate,
            users: users,
        });

        const data = await newCoupon.save();

        if (data) {
            res.render("addCoupons", { message: "Coupon Added Successfully" });
        } else {
            res.render("addCoupons", { message: "Something went wrong" });
        }
    } catch (error) {
        next(error);
    }
};

const loadEditCoupon = async (req, res, next) => {
    try {
        const couponId = req.query.id;
        const couponData = await Coupon.findById({ _id: couponId });

        res.render("editCoupons", { data: couponData });
    } catch (error) {
        next(error);
    }
};

const editCoupon = async (req, res, next) => {
    try {
        const id = req.body.id;
        let coupon = await Coupon.findById(id);

        if (coupon) {
            coupon.couponName = req.body.couponName;
            coupon.discountPercentage = req.body.discount;
            coupon.minimumPurchase = req.body.minPurchase;
            coupon.startingDate = req.body.startDate;
            coupon.expiryDate = req.body.expiryDate;
            coupon.users = req.body.users || [];

            const data = await coupon.save();

            if (data) {
                res.redirect("/admin/coupons");
            } else {
                res.render("editCoupons", { message: "Something went Wrong" });
            }
        } else {
            res.redirect("/admin/coupons");
        }
    } catch (error) {
        next(error);
    }
};

const deleteCoupon = async (req, res, next) => {
    try {
        const couponId = req.query.id;

        const coupon = await Coupon.deleteOne({ _id: couponId });

        res.redirect("/admin/coupons");
    } catch (error) {
        next(error);
    }
};

module.exports = {
    loadCoupons,
    loadAddCoupons,
    addCoupon,
    loadEditCoupon,
    editCoupon,
    deleteCoupon,
};
