const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Lütfen adınızı girin']
    },
    email: {
        type: String,
        required: [true, 'Lütfen e-posta adresinizi girin'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Lütfen geçerli bir e-posta adresi girin'
        ]
    },
    password: {
        type: String,
        required: [true, 'Lütfen bir şifre belirleyin'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    department: {
        type: String,
        default: 'Belirtilmemiş'
    }
}, { timestamps: true });

// hashing
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// check password
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);