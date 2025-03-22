// controllers/userController.js
const User = require('../models/user');
const { Item } = require('../models/item');

// Registration form
exports.showSignUpForm = (req, res) => {
    if (req.session.user) {
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile');
    }
    res.render('./user/new');
};

// Handle registration
exports.registerUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/users/login');
    } catch (err) {
        req.flash('error', err.code === 11000 ? 'Email has been used.' : err.message);
        res.redirect('/users/new');
    }
};

// Login form
exports.showLoginForm = (req, res) => {
    if (req.session.user) {
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile');
    }
    res.render('./user/login');
};

// Handle login
exports.loginUser = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            req.flash('error', 'Incorrect email');
            return res.redirect('/users/login');
        }
        const isPasswordCorrect = await user.comparePassword(req.body.password);
        if (!isPasswordCorrect) {
            req.flash('error', 'Incorrect password');
            return res.redirect('/users/login');
        }
        req.session.user = user._id;
        req.flash('success', 'Successfully logged in!');
        return res.redirect('/users/profile');
    } catch (err) {
        req.flash('error', 'Error logging in');
        return res.redirect('/users/login');
    }
};

// Profile
exports.showProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user);
        const items = await Item.find({ seller: user._id });
        res.render('user/profile', { user, items });
    } catch (err) {
        req.flash('error', 'Error loading profile.');
        res.redirect('back');
    }
};

// Logout
exports.logoutUser = (req, res, next) => {
    req.flash('success', 'Logged out successfully.'); 
    req.session.destroy(err => {
        if (err) return next(err); 
        res.redirect('/'); 
    });
};