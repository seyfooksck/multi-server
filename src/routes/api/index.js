const express = require('express');
const router = express.Router();
const apiController = require('../../controller/api/Controller');
const apiAuth = require('../../middleware/apiAuth');

router.use(apiAuth);

router.get('/', apiController.index);

module.exports = router;
