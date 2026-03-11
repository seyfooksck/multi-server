const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'danger', 'primary', 'secondary', 'dark'],
        default: 'info'
    },
    category: {
        type: String,
        enum: ['system', 'announcement', 'general'],
        default: 'general'
    },
    icon: {
        type: String,
        default: 'fi fi-rr-bell' // Default icon class
    },
    link: {
        type: String,
        default: null
    },
    read: {
        type: Boolean,
        default: false
    },
    metadata: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

// Index for faster queries on recipient and read status
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
