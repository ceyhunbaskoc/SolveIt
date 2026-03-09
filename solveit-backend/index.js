const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const issueRoutes = require('./src/routes/issueRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('[DB] MongoDB Connection Successful!'))
    .catch((err) => console.error('[DB] MongoDB Connection Failed:', err.message));

app.use('/api/issues', issueRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'UniFix API is running. Welcome, SoloStack!' });
});

app.listen(PORT, () => {
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
});