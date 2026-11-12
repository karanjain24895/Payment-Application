const express = require('express');
const router = express.Router();
const {
  getAdminConversionRate,
  updateConversionRate,
  getAdminStats,
  getAllTransactions,
  getAllUsers
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

router.use(protect, requireAdmin);

router.get('/conversion-rate', getAdminConversionRate);
router.put('/conversion-rate', updateConversionRate);
router.get('/stats', getAdminStats);
router.get('/transactions', getAllTransactions);
router.get('/users', getAllUsers);

module.exports = router;
