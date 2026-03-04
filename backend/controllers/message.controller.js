const Message = require('../models/Message');

// @desc    Get chat history between two users
// @route   GET /api/messages/:userId
// @access  Private
const getChatHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId },
            ],
        })
            .sort({ createdAt: 1 }) // Oldest first
            .limit(100) // Limit to last 100 messages
            .populate('senderId', 'username')
            .populate('receiverId', 'username');

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching chat history',
        });
    }
};

module.exports = { getChatHistory };
