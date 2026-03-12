const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Bu işleme erişmek için giriş yapmalısınız (Token eksik).' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('Auth middleware - decoded token:', decoded);
        console.log('Auth middleware - decoded.id:', decoded.id);

        req.user = await User.findById(decoded.id).select('-password');
        
        // ObjectId'yi string'e çevir ki karşılaştırmalar doğru çalışsın
        if (req.user) {
          req.user._id = req.user._id.toString();
        }
        
        console.log('Auth middleware - req.user:', req.user);
        console.log('Auth middleware - req.user._id:', req.user._id);
        
        if(!req.user) {
           return res.status(401).json({ success: false, message: 'Bu tokene ait kullanıcı artık mevcut değil.' }); 
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ 
            success: false, 
            message: 'Geçersiz veya süresi dolmuş token.' 
        });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `${req.user.role} rolünün bu işleme yetkisi yoktur.` 
            });
        }
        next();
    };
};