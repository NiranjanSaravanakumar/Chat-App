const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const initializeSocket = require('./sockets/chat.socket');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:4200', // Angular dev server
        methods: ['GET', 'POST'],
    },
});

// ─── Middleware ───
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ───
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/users', require('./routes/user.routes'));

// ─── Health Check ───
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: '💬 Chat App API is live!',
        timestamp: new Date().toISOString(),
    });
});

// ─── Initialize Socket.IO ───
initializeSocket(io);

// ─── Connect to DB & Start Server ───
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📡 Socket.IO ready for connections`);
        console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
});
