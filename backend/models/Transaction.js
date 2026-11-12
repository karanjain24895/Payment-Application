const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      unique: true,
      required: true
    },
    type: {
      type: String,
      enum: ['PURCHASE', 'TRANSFER'],
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    points: {
      type: Number,
      required: true,
      min: [0.01, 'Points must be greater than 0']
    },
    amountInRupees: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'CARD', 'NET_BANKING', 'SIMULATED_GATEWAY', 'NONE'],
      default: 'NONE'
    },
    paymentReference: {
      type: String,
      default: ''
    },
    note: {
      type: String,
      maxlength: 200,
      default: ''
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS'
    },
    failureReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ recipient: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
