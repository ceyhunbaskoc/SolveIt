require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const cron = require('node-cron');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const issueRoutes = require('./src/routes/issueRoutes');
const userRoutes = require('./src/routes/userRoutes');
const cleanupOldIssues = require('./src/utils/cleanupOldIssues');

const app = express();

// Middleware
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log('MongoDB Connection Failed: ', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/users', userRoutes);

// Schedule cleanup - Her gün saat 00:00'da çalışır
cron.schedule('0 0 * * *', () => {
  console.log('[CRON] Running daily cleanup of old resolved issues...');
  cleanupOldIssues();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('[CRON] Scheduled cleanup: Daily at 00:00 (midnight)');
});