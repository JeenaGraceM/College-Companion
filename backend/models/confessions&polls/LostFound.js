const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
    itemType: {
        type: String,
        required: true,
        enum: ['Lost', 'Found']
    },
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    contactInfo: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
        enum: ['Pending', 'Resolved']
    },
    imageUrls: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

const LostFound = mongoose.model('LostFound', lostFoundSchema);
module.exports = LostFound;