const express = require('express');
const router = express.Router();
const { getChatHistory } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

// All message routes are protected
router.get('/:userId', protect, getChatHistory);

module.exports = router;
