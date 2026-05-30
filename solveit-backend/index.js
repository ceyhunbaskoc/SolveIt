require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const cron = require('node-cron');
const http = require('http');
const { Server } = require('socket.io');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const issueRoutes = require('./src/routes/issueRoutes');
const userRoutes = require('./src/routes/userRoutes');
const cleanupOldIssues = require('./src/utils/cleanupOldIssues');
const { connect: connectRabbitMQ } = require('./src/utils/rabbitmq');
const { startConsumer } = require('./src/workers/notificationConsumer');
const { connect: connectRedis } = require('./src/utils/redis');

const app = express();

// Socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://solveit-frontend.vercel.app",
        methods: ["GET", "POST"]
    }
});

// Make io available to other files
app.set('socketio', io);

// Middleware
app.use(cors({
  origin: ["https://solveit-frontend.vercel.app", "http://localhost:5173"],
  credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log('MongoDB Connection Failed: ', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "Civic Luminescence (SolveIt) REST API Başarıyla Çalışıyor",
        version: "1.0.0"
    });
});

// Schedule cleanup - Her gün saat 00:00'da çalışır
cron.schedule('0 0 * * *', () => {
  console.log('[CRON] Running daily cleanup of old resolved issues...');
  cleanupOldIssues();
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    console.log('[CRON] Scheduled cleanup: Daily at 00:00 (midnight)');
    console.log('[SOCKET] Socket.io server initialized');

    connectRedis();
    await connectRabbitMQ();
    await startConsumer();
});

// Socket connection handling
io.on('connection', (socket) => {
    console.log('[SOCKET] User connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('[SOCKET] User disconnected:', socket.id);
    });
});