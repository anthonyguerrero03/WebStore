// routes/itemRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isLoggedIn, isSeller } = require('../middlewares/auth');
const upload = multer({ dest: 'public/images/' });
const itemController = require('../controllers/itemController');

// Show all items
router.get('/', itemController.showAllItems);

// Show new item form (restricted to logged-in users)
router.get('/new', isLoggedIn, (req, res) => {
    res.render('new'); 
});

// Show item details
router.get('/:id', itemController.showItemDetails);

// Handle item search
router.post('/search', itemController.searchItems);

// Show edit form (restricted to seller and logged-in users)
router.get('/:id/edit', isLoggedIn, isSeller, itemController.showEditForm);

// Handle creating a new item (restricted to logged-in users)
router.post('/', isLoggedIn, upload.single('image'), itemController.addNewItem);

// Handle edit submission with image upload (restricted to seller and logged-in users)
router.post('/:id/edit', isLoggedIn, isSeller, upload.single('image'), itemController.editItem);

// Handle deletion (restricted to seller and logged-in users)
router.post('/:id/delete', isLoggedIn, isSeller, itemController.deleteItem);

module.exports = router;
