const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d' // Token 30 gün geçerli olsun
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;

        // check email already valid
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Bu e-posta adresi zaten kullanımda.' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            department
        });

        res.status(201).json({
            success: true,
            message: 'Kayıt işlemi başarılı.',
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Lütfen e-posta ve şifrenizi girin.' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Geçersiz e-posta veya şifre.' });
        }

        res.status(200).json({
            success: true,
            message: 'Giriş başarılı.',
            token: generateToken(user._id),
            role: user.role,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
    }
};