const mongoose = require('mongoose');

// Define the structure (schema) for a Lost or Found item
const lostFoundSchema = new mongoose.Schema({
    // Item Type: 'Lost' or 'Found'
    itemType: {
        type: String,
        required: true,
        enum: ['Lost', 'Found'] // Ensures the value is only one of these two
    },
    // The name of the item
    itemName: {
        type: String,
        required: true,
        trim: true // Removes whitespace from both ends of a string
    },
    // Detailed description of the item
    description: {
        type: String,
        required: true
    },
    // Contact information (email or phone)
    contactInfo: {
        type: String,
        required: true
    },
    // Status (e.g., 'Pending', 'Resolved'). Default to 'Pending'.
    status: {
        type: String,
        required: true,
        default: 'Pending',
        enum: ['Pending', 'Resolved']
    },
    // Array to hold URLs for uploaded images (we will implement the actual file upload later)
    imageUrls: {
        type: [String], // Array of strings
        default: []
    }
}, {
    // Automatically add 'createdAt' and 'updatedAt' timestamps
    timestamps: true
});

// Create the Mongoose model from the schema
const LostFound = mongoose.model('LostFound', lostFoundSchema);

module.exports = LostFound;
