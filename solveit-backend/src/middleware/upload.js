const multer = require('multer');
const path = require('path');

// Render'da dosya yükleme için memory storage kullan
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Sadece resim dosyalarına izin ver
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Sadece resim dosyaları yüklenebilir.'), false);
        }
        cb(null, true);
    }
});

module.exports = upload;