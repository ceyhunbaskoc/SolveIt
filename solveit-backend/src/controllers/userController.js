const User = require('../models/User');

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