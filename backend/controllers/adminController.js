const Config = require('../models/Config');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const getAdminConversionRate = async (req, res) => {
  try {
    let config = await Config.findOne({ key: 'conversion_rate' }).populate('updatedBy', 'name email');
    
    if (!config) {
      const defaultRate = Number(process.env.DEFAULT_CONVERSION_RATE) || 10;
      config = await Config.create({
        key: 'conversion_rate',
        value: defaultRate,
        description: 'Number of wallet points given per 1 INR (Indian Rupee)',
        updatedBy: req.user._id
      });
    }

    return res.json({
      success: true,
      conversionRate: config.value,
      description: config.description,
      updatedBy: config.updatedBy,
      updatedAt: config.updatedAt
    });
  } catch (error) {
    console.error('getAdminConversionRate error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch conversion rate'
    });
  }
};

const updateConversionRate = async (req, res) => {
  try {
    const { pointsPerRupee, description } = req.body;

    const rate = Number(pointsPerRupee);
    if (!rate || isNaN(rate) || rate <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Conversion rate must be a valid positive number greater than 0'
      });
    }

    let config = await Config.findOne({ key: 'conversion_rate' });

    if (!config) {
      config = new Config({
        key: 'conversion_rate'
      });
    }

    config.value = rate;
    if (description !== undefined) {
      config.description = description;
    }
    config.updatedBy = req.user._id;

    await config.save();

    const populatedConfig = await Config.findById(config._id).populate('updatedBy', 'name email');

    return res.json({
      success: true,
      message: `Conversion rate successfully updated to 1 INR = ${rate} Points`,
      conversionRate: populatedConfig.value,
      description: populatedConfig.description,
      updatedBy: populatedConfig.updatedBy,
      updatedAt: populatedConfig.updatedAt
    });
  } catch (error) {
    console.error('updateConversionRate error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update conversion rate'
    });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    const [purchaseAgg] = await Transaction.aggregate([
      { $match: { type: 'PURCHASE', status: 'SUCCESS' } },
      {
        $group: {
          _id: null,
          totalRupeesRevenue: { $sum: '$amountInRupees' },
          totalPointsPurchased: { $sum: '$points' },
          count: { $sum: 1 }
        }
      }
    ]);

    const [transferAgg] = await Transaction.aggregate([
      { $match: { type: 'TRANSFER', status: 'SUCCESS' } },
      {
        $group: {
          _id: null,
          totalPointsTransferred: { $sum: '$points' },
          count: { $sum: 1 }
        }
      }
    ]);

    const [balanceAgg] = await User.aggregate([
      { $match: { role: 'user' } },
      {
        $group: {
          _id: null,
          totalCirculatingPoints: { $sum: '$walletBalance' }
        }
      }
    ]);

    let config = await Config.findOne({ key: 'conversion_rate' });
    const currentRate = config ? config.value : (Number(process.env.DEFAULT_CONVERSION_RATE) || 10);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        currentConversionRate: currentRate,
        totalRupeesRevenue: purchaseAgg ? purchaseAgg.totalRupeesRevenue : 0,
        totalPointsPurchased: purchaseAgg ? purchaseAgg.totalPointsPurchased : 0,
        purchasesCount: purchaseAgg ? purchaseAgg.count : 0,
        totalPointsTransferred: transferAgg ? transferAgg.totalPointsTransferred : 0,
        transfersCount: transferAgg ? transferAgg.count : 0,
        totalCirculatingPoints: balanceAgg ? balanceAgg.totalCirculatingPoints : 0
      }
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load admin stats'
    });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const { type, page = 1, limit = 25, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (type && type !== 'ALL') {
      query.type = type;
    }

    if (search && search.trim()) {
      query.$or = [
        { referenceId: { $regex: search.trim(), $options: 'i' } },
        { paymentReference: { $regex: search.trim(), $options: 'i' } },
        { note: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role')
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
    console.error('getAllTransactions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions'
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

module.exports = {
  getAdminConversionRate,
  updateConversionRate,
  getAdminStats,
  getAllTransactions,
  getAllUsers
};
