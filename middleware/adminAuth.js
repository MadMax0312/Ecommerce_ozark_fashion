const isLogin = (req, res, next) => {
    try {
        if (req.session.admin_id) {
            return next();
        } else {
            res.redirect("/admin");
        }
    } catch (error) {
        console.log(error.message);
        res.redirect("/admin");
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.admin_id) {
            res.redirect("/admin/home");
        } else {
            return next(); // Proceed to the next middleware or route
        }
    } catch (error) {
        console.log(error.message);
        res.redirect("/admin/dashboard");
    }
};

module.exports = {
    isLogin,
    isLogout,
};
