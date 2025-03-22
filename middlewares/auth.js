// middlewares/auth.js
const { Item } = require('../models/item');

exports.isGuest = (req, res, next) => {
    if (!req.session.user) return next();
    req.flash('error', 'You are logged in already');
    res.redirect('/users/profile');
};

exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) return next();
    req.flash('error', 'You must log in first!');
    res.redirect('/users/login');
};

exports.isSeller = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id);
        
        if (!item) {
            req.flash('error', 'Item not found');
            return res.status(404).redirect('/items'); 
        }

        if (!item.seller || !item.seller.equals(req.session.user)) {
            const err = new Error('Unauthorized to access this resource');
            err.status = 401;
            return next(err);
        }

        next(); 
    } catch (error) {
        console.error('Authorization error:', error);
        const err = new Error('Server authorization error');
        err.status = 500;
        next(err);
    }
};
