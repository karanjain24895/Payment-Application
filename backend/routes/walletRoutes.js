const express = require('express');
const router = express.Router();
const {
  getConversionRate,
  purchasePoints,
  transferPoints,
  getMyTransactions
} = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversion-rate', getConversionRate);
router.post('/purchase', protect, purchasePoints);
router.post('/transfer', protect, transferPoints);
router.get('/transactions', protect, getMyTransactions);

module.exports = router;
