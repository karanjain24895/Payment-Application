const mongoose = require('mongoose');

const configSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'conversion_rate'
    },
    value: {
      type: Number,
      required: true,
      min: [0.01, 'Conversion rate must be greater than 0'],
      default: 10
    },
    description: {
      type: String,
      default: 'Number of wallet points given per 1 INR (Indian Rupee)'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Config', configSchema);
