const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth.middleware');

// @desc    Get all users (for chat user list)
// @route   GET /api/users
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        // Return all users except the logged-in user
        const users = await User.find({ _id: { $ne: req.user._id } }).select(
            'username email isOnline createdAt'
        );

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
        });
    }
});

module.exports = router;
