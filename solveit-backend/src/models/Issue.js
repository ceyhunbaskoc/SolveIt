const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Please add a title'] 
    },
    description: { 
        type: String, 
        required: [true, 'Please add a description'] 
    },
    category: { 
        type: String, 
        required: [true, 'Please select a category'] 
    },
    status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'],
        default: 'PENDING'
    },
    reporterId: { 
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true 
    },
    location: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    imageUrl: { 
        type: String, 
        default: 'no-photo.jpg'
    }
}, { 
    timestamps: true
});

module.exports = mongoose.model('Issue', issueSchema);