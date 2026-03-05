const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// ─── In-Memory Mock Data ───
const JWT_SECRET = 'mock-secret-key';

const users = [
    { _id: 'user1', username: 'Lucky', email: 'lucky@test.com', password: 'password123', isOnline: false, createdAt: new Date().toISOString() },
    { _id: 'user2', username: 'Ravi', email: 'ravi@test.com', password: 'password123', isOnline: false, createdAt: new Date().toISOString() },
    { _id: 'user3', username: 'Priya', email: 'priya@test.com', password: 'password123', isOnline: false, createdAt: new Date().toISOString() },
    { _id: 'user4', username: 'Amit', email: 'amit@test.com', password: 'password123', isOnline: false, createdAt: new Date().toISOString() },
];

const messages = [
    { _id: 'msg1', senderId: { _id: 'user2', username: 'Ravi' }, receiverId: { _id: 'user1', username: 'Lucky' }, message: 'Hey Lucky! How are you?', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: 'msg2', senderId: { _id: 'user1', username: 'Lucky' }, receiverId: { _id: 'user2', username: 'Ravi' }, message: 'Hey Ravi! I am good, working on a chat app 🚀', createdAt: new Date(Date.now() - 3500000).toISOString() },
    { _id: 'msg3', senderId: { _id: 'user2', username: 'Ravi' }, receiverId: { _id: 'user1', username: 'Lucky' }, message: 'That sounds awesome! Is it MEAN stack?', createdAt: new Date(Date.now() - 3400000).toISOString() },
    { _id: 'msg4', senderId: { _id: 'user1', username: 'Lucky' }, receiverId: { _id: 'user2', username: 'Ravi' }, message: 'Yes! MongoDB, Express, Angular, Node.js with Socket.IO for real-time chat', createdAt: new Date(Date.now() - 3300000).toISOString() },
    { _id: 'msg5', senderId: { _id: 'user3', username: 'Priya' }, receiverId: { _id: 'user1', username: 'Lucky' }, message: 'Hi Lucky, can you help me with DSA?', createdAt: new Date(Date.now() - 2000000).toISOString() },
    { _id: 'msg6', senderId: { _id: 'user1', username: 'Lucky' }, receiverId: { _id: 'user3', username: 'Priya' }, message: 'Sure! What topic are you stuck on?', createdAt: new Date(Date.now() - 1900000).toISOString() },
];

let msgCounter = 7;

// ─── Active users map ───
const activeUsers = new Map();

// ─── Express Setup ───
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

// ─── Helper ───
const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = users.find((u) => u._id === decoded.id);
        if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// ─── Auth Routes ───
app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    if (users.find((u) => u.email === email)) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    if (users.find((u) => u.username === username)) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
    }
    const newUser = {
        _id: 'user' + (users.length + 1),
        username, email, password, isOnline: false,
        createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    const token = generateToken(newUser._id);
    console.log(`✅ New user registered: ${username}`);
    res.status(201).json({
        success: true, message: 'User registered successfully',
        data: { _id: newUser._id, username, email, token },
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = generateToken(user._id);
    console.log(`✅ User logged in: ${user.username}`);
    res.json({
        success: true, message: 'Login successful',
        data: { _id: user._id, username: user.username, email: user.email, token },
    });
});

app.get('/api/auth/me', authenticate, (req, res) => {
    res.json({ success: true, data: req.user });
});

// ─── User Routes ───
app.get('/api/users', authenticate, (req, res) => {
    const filtered = users
        .filter((u) => u._id !== req.user._id)
        .map((u) => ({
            _id: u._id, username: u.username, email: u.email,
            isOnline: activeUsers.has(u._id), createdAt: u.createdAt,
        }));
    res.json({ success: true, count: filtered.length, data: filtered });
});

// ─── Message Routes ───
app.get('/api/messages/:userId', authenticate, (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    const history = messages.filter(
        (m) =>
            (m.senderId._id === currentUserId && m.receiverId._id === userId) ||
            (m.senderId._id === userId && m.receiverId._id === currentUserId)
    );
    res.json({ success: true, count: history.length, data: history });
});

// ─── Health Check ───
app.get('/', (req, res) => {
    res.json({ status: 'running', message: '💬 Mock Chat API is live! (No DB needed)', mock: true });
});

// ─── Socket.IO ───
io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('user-online', (userId) => {
        activeUsers.set(userId, socket.id);
        io.emit('online-users', Array.from(activeUsers.keys()));
        const user = users.find((u) => u._id === userId);
        console.log(`✅ ${user?.username || userId} is online`);
    });

    socket.on('send-message', (data) => {
        const { senderId, receiverId, message } = data;
        const sender = users.find((u) => u._id === senderId);
        const receiver = users.find((u) => u._id === receiverId);
        const newMsg = {
            _id: 'msg' + msgCounter++,
            senderId: { _id: senderId, username: sender?.username || 'Unknown' },
            receiverId: { _id: receiverId, username: receiver?.username || 'Unknown' },
            message,
            createdAt: new Date().toISOString(),
        };
        messages.push(newMsg);

        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receive-message', newMsg);
        }
        socket.emit('message-sent', newMsg);
        console.log(`💬 ${sender?.username} → ${receiver?.username}: ${message}`);
    });

    socket.on('typing', (data) => {
        const receiverSocketId = activeUsers.get(data.receiverId);
        if (receiverSocketId) io.to(receiverSocketId).emit('user-typing', data);
    });

    socket.on('stop-typing', (data) => {
        const receiverSocketId = activeUsers.get(data.receiverId);
        if (receiverSocketId) io.to(receiverSocketId).emit('user-stop-typing', data);
    });

    socket.on('disconnect', () => {
        for (const [userId, socketId] of activeUsers.entries()) {
            if (socketId === socket.id) {
                activeUsers.delete(userId);
                io.emit('online-users', Array.from(activeUsers.keys()));
                const user = users.find((u) => u._id === userId);
                console.log(`❌ ${user?.username || userId} disconnected`);
                break;
            }
        }
    });
});

// ─── Start ───
const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Mock Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO ready`);
    console.log(`👥 Pre-loaded ${users.length} users & ${messages.length} messages`);
    console.log(`\n📋 Test accounts:`);
    users.forEach((u) => console.log(`   📧 ${u.email} / ${u.password}`));
    console.log('');
});
