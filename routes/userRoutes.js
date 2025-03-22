// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isGuest, isLoggedIn } = require('../middlewares/auth'); 

// Only allow guests to register
// router.post('/', isGuest, userController.registerUser);

// Show Sign-up form (restricted to guests)
router.get('/new', isGuest, userController.showSignUpForm);

// Handle registration (restricted to guests)
router.post('/new', isGuest, userController.registerUser);

// Login form (restricted to guests)
router.get('/login', isGuest, userController.showLoginForm);

// Handle login (restricted to guests)
router.post('/login', isGuest, userController.loginUser);

// Profile (restricted to logged-in users)
router.get('/profile', isLoggedIn, userController.showProfile);

// Logout (restricted to logged-in users)
router.get('/logout', isLoggedIn, userController.logoutUser);

module.exports = router;