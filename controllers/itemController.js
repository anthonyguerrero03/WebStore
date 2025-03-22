// controllers/itemController.js
const { Item } = require('../models/item');

// Landing page
exports.showLandingPage = (req, res) => {
    res.render('index');
};

// Show all items
exports.showAllItems = async (req, res) => {
    try {
        const activeItems = await Item.find({ active: true }).sort({ price: 1 });
        res.render('items', { items: activeItems });
    } catch (error) {
        req.flash('error', 'Error fetching items.');
        res.status(500).render('error', { message: 'Error fetching items' });
    }
};

// Show item details
exports.showItemDetails = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('seller', 'firstName lastName');
        if (item) {
            res.render('item', { item });
        } else {
            req.flash('error', 'Item not found');
            res.status(404).render('404', { message: 'Item not found' });
        }
    } catch (error) {
        req.flash('error', 'Error fetching item details.');
        res.status(500).render('error', { message: 'Error fetching item details' });
    }
};

// Add new item
exports.addNewItem = async (req, res) => {
    try {
        const { title, condition, price, details } = req.body;
        const image = req.file ? req.file.filename : undefined;
        const newItem = new Item({
            title,
            condition,
            price: parseFloat(price),
            details,
            image,
            seller: req.session.user,
            active: true,
        });

        
        const savedItem = await newItem.save();

        
        if (savedItem) {
            req.flash('success', 'Your item was created successfully!');
            res.redirect('/items');
        } else {
            req.flash('error', 'An error occurred while creating the item.');
            res.status(500).redirect('back');
        }
    } catch (error) {
        if (error.name === 'ValidationError') {
            req.flash('error', `Error creating item: ${error.message}`);
            res.status(400).redirect('back');
        } else {
            req.flash('error', 'An error occurred. Please try again.');
            res.status(500).redirect('back');
        }
    }
};


// Show edit form
exports.showEditForm = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (item) {
            res.render('edit', { item });
        } else {
            req.flash('error', 'Item not found.');
            res.status(404).render('404', { message: 'Item not found' });
        }
    } catch (error) {
        req.flash('error', 'Error fetching item for edit.');
        res.status(500).render('error', { message: 'Error fetching item for edit' });
    }
};

// Edit item
exports.editItem = async (req, res) => {
    const updatedData = {
        title: req.body.title,
        condition: req.body.condition,
        price: parseFloat(req.body.price),
        details: req.body.details,
    };

    if (req.file) updatedData.image = req.file.filename;

    try {
        const item = await Item.findByIdAndUpdate(req.params.id, updatedData, { runValidators: true, new: true });
        if (item) {
            req.flash('success', 'Your item was updated successfully!');
            res.redirect(`/items/${req.params.id}`);
        } else {
            req.flash('error', 'Item not found.');
            res.status(404).redirect('/items');
        }
    } catch (error) {
        if (error.name === 'ValidationError') {
            req.flash('error', `Error updating item: ${error.message}`);
            res.status(400).redirect('back');
        } else {
            req.flash('error', 'An error occurred. Please try again.');
            res.status(500).redirect('back');
        }
    }
};

// Delete item
exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (item) {
            req.flash('success', 'Your item was deleted successfully!');
            res.redirect('/items');
        } else {
            req.flash('error', 'Item not found.');
            res.status(404).redirect('/items');
        }
    } catch (error) {
        req.flash('error', 'An error occurred. Please try again.');
        res.status(500).redirect('back');
    }
};


// Controller method to handle item search
exports.searchItems = async (req, res) => {
    const searchQuery = req.body.query; 
    try {
        const items = await Item.find({
            title: { $regex: searchQuery, $options: 'i' } 
        });
        res.render('items', { items }); 
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error searching items' });
    }
};