const express = require('express');
const router = express.Router();
const subscribersController = require('../controllers/subscribersController');
const { validateSubscriber } = require('../middleware/validators');
const { createSubscriberLimiter } = require('../middleware/security');

// POST /subscribers - crear subscriber con validación y rate limiting
router.post('/',
    createSubscriberLimiter,
    validateSubscriber,
    subscribersController.createSubscriber
);

module.exports = router;