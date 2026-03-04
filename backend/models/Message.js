const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            required: [true, 'Message content is required'],
            trim: true,
            maxlength: [2000, 'Message cannot exceed 2000 characters'],
        },
    },
    {
        timestamps: true, // Adds createdAt (acts as timestamp)
    }
);

// Index for faster retrieval of conversation history
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
