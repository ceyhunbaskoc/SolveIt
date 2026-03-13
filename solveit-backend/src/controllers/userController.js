const User = require('../models/User');

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const topUsers = await User.find({ role: 'user' })
            .sort({ xp: -1 })
            .limit(10)
            .select('name department xp createdAt');
        
        res.status(200).json({ success: true, data: topUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// update user profile
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            req.body,
            { returnDocument: 'after', runValidators: true }
        ).select('-password');

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};