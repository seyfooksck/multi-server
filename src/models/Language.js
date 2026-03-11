const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    flag: {
        type: String, // Emoji or url
        default: ''
    },
    strings: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true, minimize: false });

// Ensure only one default language
languageSchema.pre('save', async function () {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { _id: { $ne: this._id } },
            { $set: { isDefault: false } }
        );
    }
});

module.exports = mongoose.model('Language', languageSchema);
