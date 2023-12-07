const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            return next();
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error.message);
        res.redirect("/login");
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect("/");
        } else {
            return next(); 
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
