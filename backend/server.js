const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Payment Wallet API',
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    const { autoSeedInitialData } = require('./scripts/seed');
    await autoSeedInitialData();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`=========================================`);
      console.log(`🚀 Wallet API Server running on port ${PORT}`);
      console.log(`👉 Health check: http://0.0.0.0:${PORT}/api/health`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
