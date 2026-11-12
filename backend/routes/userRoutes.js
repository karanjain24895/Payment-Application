const express = require('express');
const router = express.Router();
const { getOtherUsers, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getOtherUsers);
router.get('/profile', protect, getUserProfile);

module.exports = router;

