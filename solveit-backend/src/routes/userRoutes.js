const express = require('express');
const { updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.put('/profile', protect, updateProfile);

module.exports = router;