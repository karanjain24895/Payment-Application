const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const getOtherUsers = async (req, res) => {
  try {
    const search = req.query.search || '';
    const currentUserId = req.user._id;

    const query = {
      _id: { $ne: currentUserId },
      role: 'user'
    };

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('name email phoneNumber createdAt')
      .sort({ name: 1 })
      .limit(50);

    return res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('getOtherUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch registered users'
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [sentStats] = await Transaction.aggregate([
      {
        $match: {
          sender: userObjectId,
          type: 'TRANSFER',
          status: 'SUCCESS'
        }
      },
      {
        $group: {
          _id: null,
          totalPointsSent: { $sum: '$points' },
          count: { $sum: 1 }
        }
      }
    ]);

    const [receivedStats] = await Transaction.aggregate([
      {
        $match: {
          recipient: userObjectId,
          type: 'TRANSFER',
          status: 'SUCCESS'
        }
      },
      {
        $group: {
          _id: null,
          totalPointsReceived: { $sum: '$points' },
          count: { $sum: 1 }
        }
      }
    ]);

    const [purchaseStats] = await Transaction.aggregate([
      {
        $match: {
          sender: userObjectId,
          type: 'PURCHASE',
          status: 'SUCCESS'
        }
      },
      {
        $group: {
          _id: null,
          totalPointsPurchased: { $sum: '$points' },
          totalRupeesSpent: { $sum: '$amountInRupees' },
          count: { $sum: 1 }
        }
      }
    ]);

    return res.json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        stats: {
          totalPointsSent: sentStats ? sentStats.totalPointsSent : 0,
          transfersSentCount: sentStats ? sentStats.count : 0,
          totalPointsReceived: receivedStats ? receivedStats.totalPointsReceived : 0,
          transfersReceivedCount: receivedStats ? receivedStats.count : 0,
          totalPointsPurchased: purchaseStats ? purchaseStats.totalPointsPurchased : 0,
          totalRupeesSpent: purchaseStats ? purchaseStats.totalRupeesSpent : 0,
          purchasesCount: purchaseStats ? purchaseStats.count : 0
        }
      }
    });
  } catch (error) {
    console.error('getUserProfile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
};

module.exports = { getOtherUsers, getUserProfile };
