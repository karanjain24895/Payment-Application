const User = require('../models/User');
const Config = require('../models/Config');
const Transaction = require('../models/Transaction');

const autoSeedInitialData = async () => {
  try {
    const configExists = await Config.findOne({ key: 'conversion_rate' });
    if (!configExists) {
      await Config.create({
        key: 'conversion_rate',
        value: 10,
        description: 'Number of wallet points given per 1 INR (Indian Rupee)'
      });
      console.log('✅ Default conversion rate initialized (1 INR = 10 Points).');
    }

    const adminExists = await User.findOne({ email: 'admin@wallet.com' });
    let adminUser = adminExists;
    if (!adminExists) {
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@wallet.com',
        password: 'admin123',
        role: 'admin',
        walletBalance: 10000,
        phoneNumber: '+91 98765 00000'
      });
      console.log('✅ Default Admin created: admin@wallet.com / admin123');
    }

    const userCount = await User.countDocuments({ role: 'user' });
    if (userCount === 0) {
      const user1 = await User.create({
        name: 'Rahul Sharma',
        email: 'rahul@gmail.com',
        password: 'user123',
        role: 'user',
        walletBalance: 850,
        phoneNumber: '+91 98765 11111'
      });

      const user2 = await User.create({
        name: 'Priya Patel',
        email: 'priya@gmail.com',
        password: 'user123',
        role: 'user',
        walletBalance: 1200,
        phoneNumber: '+91 98765 22222'
      });

      const user3 = await User.create({
        name: 'Amit Verma',
        email: 'amit@gmail.com',
        password: 'user123',
        role: 'user',
        walletBalance: 400,
        phoneNumber: '+91 98765 33333'
      });

      const user4 = await User.create({
        name: 'Sneha Reddy',
        email: 'sneha@gmail.com',
        password: 'user123',
        role: 'user',
        walletBalance: 2500,
        phoneNumber: '+91 98765 44444'
      });

      console.log('✅ Demo users created (Rahul, Priya, Amit, Sneha with password: user123)');

      await Transaction.create({
        referenceId: `PUR-${Date.now() - 3600000}-A1B2C`,
        type: 'PURCHASE',
        sender: user1._id,
        points: 1000,
        amountInRupees: 100,
        conversionRate: 10,
        paymentMethod: 'UPI',
        paymentReference: 'UPI-SIM-898231',
        status: 'SUCCESS',
        note: 'Welcome purchase of 1000 points'
      });

      await Transaction.create({
        referenceId: `TXN-${Date.now() - 1800000}-D3E4F`,
        type: 'TRANSFER',
        sender: user1._id,
        recipient: user2._id,
        points: 150,
        status: 'SUCCESS',
        note: 'Dinner bill split'
      });

      console.log('✅ Seed transactions added.');
    }
  } catch (err) {
    console.error('Error during autoSeedInitialData:', err.message);
  }
};

module.exports = { autoSeedInitialData };
