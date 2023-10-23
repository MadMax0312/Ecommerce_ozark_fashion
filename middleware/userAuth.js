const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            return next();
        } else {
            res.redirect("/");
        }
    } catch (error) {
        console.log(error.message);
        res.redirect("/");
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect("/");
        } else {
            return next(); // Proceed to the next middleware or route
        }
    } catch (error) {
        console.log(error.message);
        res.redirect("/");
    }
};

module.exports = {
    isLogin,
    isLogout,
};
