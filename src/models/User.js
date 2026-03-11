const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    password: { type: String, required: function () { return !this.googleId; } },
    permissions: { type: Object, default: {} },
    status: { type: String, default: 'offline', enum: ['online', 'away', 'busy', 'offline'] },
    googleId: { type: String, unique: true, sparse: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Helper to get the highest permission role
userSchema.methods.getRole = function () {
    const roles = ['root', 'admin', 'mod', 'support', 'tester', 'banned', 'suspend'];
    if (this.permissions) {
        for (const role of roles) {
            if (this.permissions[role]) {
                return role.charAt(0).toUpperCase() + role.slice(1);
            }
        }
    }
    return 'User';
};

// Helper to get bootstrap class for status
userSchema.methods.getStatusClass = function () {
    const statusMap = {
        'online': 'success',
        'away': 'warning',
        'busy': 'danger',
        'offline': 'secondary'
    };
    return statusMap[this.status] || 'secondary';
};

module.exports = mongoose.model('User', userSchema);
