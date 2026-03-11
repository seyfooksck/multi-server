const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const asyncHandler = require('../../utils/asyncHandler');
const dashboardController = require('../../controller/dashboard/Controller');
const dashboardAuth = require('../../controller/dashboard/auth');
const dashboardUser = require('../../controller/dashboard/User');
const AUTH = require('../../middleware/auth');

// Login rate limiter (5 attempts per 15 minutes)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many login attempts, please try again after 15 minutes.'
});

router.get('/', AUTH('/auth/login'), asyncHandler(dashboardController.index));
router.get('/notifications', AUTH('/auth/login'), asyncHandler(dashboardController.notifications));
router.get('/under-construction', AUTH('/auth/login'), asyncHandler(dashboardController.underConstruction));
router.get('/compose', AUTH('/auth/login'), asyncHandler(dashboardController.compose));
router.get('/test', AUTH('/auth/login'), asyncHandler(dashboardController.test));

// User Profile Routes
router.get('/profile', AUTH('/auth/login'), asyncHandler(dashboardUser.profile));
router.get('/profile/edit', AUTH('/auth/login'), asyncHandler(dashboardUser.profileEdit));
router.post('/profile/edit', AUTH('/auth/login'), asyncHandler(dashboardUser.profileEditPost));
router.get('/users', AUTH('/auth/login'), asyncHandler(dashboardUser.users));

// Auth Routes
router.get('/auth/login', dashboardAuth.Login);
router.post('/auth/login', loginLimiter, dashboardAuth.LoginPost);
router.get('/auth/google', dashboardAuth.GoogleAuth);
router.get('/auth/google/callback', dashboardAuth.GoogleCallback);
router.get('/auth/register', dashboardAuth.Register);
router.post('/auth/register', dashboardAuth.RegisterPost);
router.get('/auth/logout', dashboardAuth.Logout);
router.get('/auth/forgot-password', dashboardAuth.ForgotPassword);
router.post('/auth/forgot-password', dashboardAuth.ForgotPasswordPost);
router.get('/auth/reset-password/:token', dashboardAuth.ResetPassword);
router.post('/auth/reset-password/:token', dashboardAuth.ResetPasswordPost);

// Language Management
router.get('/languages', AUTH('/auth/login'), asyncHandler(dashboardController.languages));
router.get('/languages/add', AUTH('/auth/login'), asyncHandler(dashboardController.languageAdd));
router.post('/languages/add', AUTH('/auth/login'), asyncHandler(dashboardController.languageAddPost));
router.get('/languages/edit/:id', AUTH('/auth/login'), asyncHandler(dashboardController.languageEdit));
router.post('/languages/edit/:id', AUTH('/auth/login'), asyncHandler(dashboardController.languageEditPost));
router.post('/languages/delete/:id', AUTH('/auth/login'), asyncHandler(dashboardController.languageDelete));

module.exports = router;
