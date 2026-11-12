const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Config = require('../models/Config');

const getActiveConversionRate = async () => {
  const config = await Config.findOne({ key: 'conversion_rate' });
  if (config && config.value > 0) {
    return config.value;
  }
  const defaultRate = Number(process.env.DEFAULT_CONVERSION_RATE) || 10;
  return defaultRate;
};

const getConversionRate = async (req, res) => {
  try {
    const rate = await getActiveConversionRate();
    const config = await Config.findOne({ key: 'conversion_rate' });
    
    return res.json({
      success: true,
      pointsPerRupee: rate,
      description: config ? config.description : 'Number of wallet points given per 1 INR',
      lastUpdated: config ? config.updatedAt : null
    });
  } catch (error) {
    console.error('getConversionRate error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversion rate'
    });
  }
};

const purchasePoints = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amountInRupees, paymentMethod = 'SIMULATED_GATEWAY', simulateSuccess = true } = req.body;

    const amount = Number(amountInRupees);
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount in Rupees greater than 0'
      });
    }

    const conversionRate = await getActiveConversionRate();
    const pointsToCredit = Math.round(amount * conversionRate * 100) / 100;

    const referenceId = `PUR-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const paymentReference = `PAY-SIM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    if (simulateSuccess === false) {
      const failedTxn = await Transaction.create({
        referenceId,
        type: 'PURCHASE',
        sender: userId,
        points: pointsToCredit,
        amountInRupees: amount,
        conversionRate,
        paymentMethod,
        paymentReference,
        status: 'FAILED',
        failureReason: 'Payment simulated failure (user test or gateway declined)'
      });

      return res.status(400).json({
        success: false,
        message: 'Simulated payment failed as requested. No points were added.',
        transaction: failedTxn
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: pointsToCredit } },
      { new: true }
    );

    const transaction = await Transaction.create({
      referenceId,
      type: 'PURCHASE',
      sender: userId,
      points: pointsToCredit,
      amountInRupees: amount,
      conversionRate,
      paymentMethod,
      paymentReference,
      status: 'SUCCESS',
      note: `Purchased ₹${amount} worth of wallet points at ${conversionRate} pts/₹`
    });

    return res.status(201).json({
      success: true,
      message: `Successfully purchased ${pointsToCredit} wallet points for ₹${amount}!`,
      pointsCredited: pointsToCredit,
      newWalletBalance: updatedUser.walletBalance,
      transaction
    });
  } catch (error) {
    console.error('purchasePoints error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Payment processing failed'
    });
  }
};

const transferPoints = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { recipientId, points, note = '' } = req.body;

    const pointsNum = Number(points);
    if (!pointsNum || isNaN(pointsNum) || pointsNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid point amount greater than 0'
      });
    }

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Please select a recipient to transfer points to'
      });
    }

    if (recipientId.toString() === senderId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot transfer wallet points to yourself'
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Selected recipient user not found'
      });
    }

    const updatedSender = await User.findOneAndUpdate(
      { _id: senderId, walletBalance: { $gte: pointsNum } },
      { $inc: { walletBalance: -pointsNum } },
      { new: true }
    );

    if (!updatedSender) {
      const currentSender = await User.findById(senderId);
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet points. Your balance is ${currentSender ? currentSender.walletBalance : 0} points, but you tried to transfer ${pointsNum} points.`
      });
    }

    await User.findByIdAndUpdate(
      recipientId,
      { $inc: { walletBalance: pointsNum } }
    );

    const referenceId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const transaction = await Transaction.create({
      referenceId,
      type: 'TRANSFER',
      sender: senderId,
      recipient: recipientId,
      points: pointsNum,
      note: note.trim(),
      status: 'SUCCESS'
    });

    const populatedTxn = await Transaction.findById(transaction._id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');

    return res.status(200).json({
      success: true,
      message: `Successfully transferred ${pointsNum} points to ${recipient.name}!`,
      newWalletBalance: updatedSender.walletBalance,
      transaction: populatedTxn
    });
  } catch (error) {
    console.error('transferPoints error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process points transfer'
    });
  }
};

const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, search, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const baseQuery = {};

    if (type === 'PURCHASE') {
      baseQuery.sender = userId;
      baseQuery.type = 'PURCHASE';
    } else if (type === 'SENT') {
      baseQuery.sender = userId;
      baseQuery.type = 'TRANSFER';
    } else if (type === 'RECEIVED') {
      baseQuery.recipient = userId;
      baseQuery.type = 'TRANSFER';
    } else if (type === 'TRANSFER') {
      baseQuery.type = 'TRANSFER';
      baseQuery.$or = [{ sender: userId }, { recipient: userId }];
    } else {
      baseQuery.$or = [{ sender: userId }, { recipient: userId }];
    }

    if (search && search.trim()) {
      baseQuery.$and = [
        { $or: [{ referenceId: { $regex: search.trim(), $options: 'i' } }, { note: { $regex: search.trim(), $options: 'i' } }] }
      ];
    }

    const total = await Transaction.countDocuments(baseQuery);
    const transactions = await Transaction.find(baseQuery)
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      transactions
    });
  } catch (error) {
    console.error('getMyTransactions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history'
    });
  }
};

module.exports = {
  getConversionRate,
  purchasePoints,
  transferPoints,
  getMyTransactions
};
