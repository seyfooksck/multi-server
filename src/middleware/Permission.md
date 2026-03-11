# Permission System Documentation

This document explains the advanced permission system implemented in the application.

## Overview

The permission system uses a `permissions` object in the `User` model to provide granular control.

1.  **`permissions`**: An object map of booleans (e.g., `{ "user:read": true, "support": true }`).

## usage

The system is implemented as an Express middleware factory: `checkPermission`.

### Import

```javascript
const checkPermission = require('../middleware/permission');
```

### Applying to Routes

You must use the `auth` middleware (or `adminAuth`) *before* the permission middleware.

```javascript
const express = require('express');
const router = express.Router();
const checkPermission = require('../../middleware/permission');
const AUTH = require('../../middleware/auth');

// Example: Protect a route that requires 'user:read' permission
router.get('/users', 
    AUTH, 
    checkPermission('user:read'), 
    UserController.listUsers
);
```

### User Model Structure

The `User` model (`src/models/User.js`) has been updated:

```javascript
const userSchema = new mongoose.Schema({
    // ...
    permissions: { type: Object, default: {} }, // E.g., { "support": true, "user:read": true }
    // ...
});
```

## How Logic Works

1.  **Authentication**: The `auth` middleware verifies the JWT and adds `req.user`.
2.  **User Lookup**: The middleware fetches the user from the database.
3.  **Support Check**: If `user.permissions.support` is `true`, access is granted (Bypass).
4.  **Permission Check**: The middleware checks if `user.permissions[requiredPermission]` is `true`.

## Adding Permissions

Permissions are managed as keys in the `permissions` object.

**Example Code:**

```javascript
const user = await User.findOne({ email: 'admin@example.com' });

// Grant specific permission
user.permissions['user:read'] = true;

// Grant support access (Super Admin)
user.permissions['support'] = true;

// Mongoose requires marking Mixed types as modified if referenced via dot notation or variable
user.markModified('permissions'); 
await user.save();
```
