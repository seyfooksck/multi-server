const express = require('express');
const router = express.Router();
const homeController = require('../../controller/main/Controller');

router.get('/', homeController.index);


module.exports = router;

//router.get('/test-email', async (req, res) => {
//    const emailService = require('../../utils/email');
//    try {
//        const result = await emailService.sendEmail(
//            'seyfo@example.com', // Replace with real recipient for testing
//            'Welcome to MyApp!',
//            'welcome',
//            { name: 'Seyfo', actionUrl: 'http://localhost:3002' }
//        );
//        res.json(result);
//    } catch (error) {
//        res.status(500).json({ error: error.message });
//    }
//});