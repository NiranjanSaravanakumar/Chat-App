const Message = require('../models/Message');
const User = require('../models/User');

// HashMap to track active user sessions: { userId: socketId }
const activeUsers = new Map();

const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 New socket connected: ${socket.id}`);

        // ─── Event: User comes online ───
        socket.on('user-online', async (userId) => {
            activeUsers.set(userId, socket.id);

            // Update user status in DB
            await User.findByIdAndUpdate(userId, { isOnline: true });

            // Broadcast updated online users list to all clients
            io.emit('online-users', Array.from(activeUsers.keys()));

            console.log(`✅ User ${userId} is online. Active users: ${activeUsers.size}`);
        });

        // ─── Event: Send a private message ───
        socket.on('send-message', async (data) => {
            const { senderId, receiverId, message } = data;

            try {
                // Save message to MongoDB
                const newMessage = await Message.create({
                    senderId,
                    receiverId,
                    message,
                });

                // Populate sender info for the response
                const populatedMessage = await Message.findById(newMessage._id)
                    .populate('senderId', 'username')
                    .populate('receiverId', 'username');

                // Send message to the receiver if they are online
                const receiverSocketId = activeUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive-message', populatedMessage);
                }

                // Send confirmation back to the sender
                socket.emit('message-sent', populatedMessage);
            } catch (error) {
                console.error('❌ Error saving message:', error.message);
                socket.emit('message-error', { error: 'Failed to send message' });
            }
        });

        // ─── Event: User is typing ───
        socket.on('typing', (data) => {
            const { senderId, receiverId } = data;
            const receiverSocketId = activeUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user-typing', { senderId });
            }
        });

        // ─── Event: User stopped typing ───
        socket.on('stop-typing', (data) => {
            const { senderId, receiverId } = data;
            const receiverSocketId = activeUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user-stop-typing', { senderId });
            }
        });

        // ─── Event: User disconnects ───
        socket.on('disconnect', async () => {
            // Find which user had this socket ID
            let disconnectedUserId = null;
            for (const [userId, socketId] of activeUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    break;
                }
            }

            if (disconnectedUserId) {
                activeUsers.delete(disconnectedUserId);

                // Update user status in DB
                await User.findByIdAndUpdate(disconnectedUserId, { isOnline: false });

                // Broadcast updated online users list
                io.emit('online-users', Array.from(activeUsers.keys()));

                console.log(`❌ User ${disconnectedUserId} disconnected. Active users: ${activeUsers.size}`);
            }
        });
    });
};

module.exports = initializeSocket;
