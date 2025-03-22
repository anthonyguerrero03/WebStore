// models/item.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const itemSchema = new Schema({
    title: { type: String, required: [true, 'Title is required'], trim: true, minLength: 3 },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Seller is required'] }, // Reference to User model
    condition: { 
        type: String, 
        required: [true, 'Condition is required'], 
        enum: { 
            values: ['New', 'Like New', 'Used', 'Fair', 'Poor'], 
            message: 'Condition must be either New, Like New, Used, Fair, or Poor' 
        } 
    },
    price: { type: Number, required: true, min: 0.01 },
    details: { type: String, required: true, minLength: 10 },
    image: { type: String, required: [true, 'Image is required'] },
    active: { type: Boolean, default: true },
    offersReceived: { type: Number, default: 0 }
});

// Create the model
const Item = mongoose.model('Item', itemSchema);

// Helper functions
const itemOperations = {
    getAllActiveItems: async () => {
        try {
            return await Item.find({ active: true }).sort({ price: 1 });
        } catch (error) {
            throw error;
        }
    },

    addItem: async (itemData) => {
        try {
            const newItem = new Item({
                ...itemData,
                active: true,
                offersReceived: 0
            });
            return await newItem.save();
        } catch (error) {
            throw error;
        }
    },

    findItemById: async (id) => {
        try {
            return await Item.findById(id).populate('seller'); 
        } catch (error) {
            throw error;
        }
    },

    updateItem: async (id, updatedData) => {
        try {
            return await Item.findByIdAndUpdate(
                id,
                updatedData,
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw error;
        }
    },

    deleteItem: async (id) => {
        try {
            const result = await Item.findByIdAndDelete(id);
            return !!result;
        } catch (error) {
            throw error;
        }
    },

    searchItems: async (searchTerm) => {
        try {
            return await Item.find({
                $or: [
                    { title: { $regex: searchTerm, $options: 'i' } },
                    { details: { $regex: searchTerm, $options: 'i' } }
                ]
            });
        } catch (error) {
            throw error;
        }
    },
};

module.exports = {
    Item,
    ...itemOperations
};