const express = require('express');
const router = express.Router();
const subscribersController = require('../controllers/subscribersController');

router.post('/:email', subscribersController.createSubscriber);

module.exports = router;