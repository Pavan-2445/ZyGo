const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    orderId: { type: String, required: true },
    paymentId: { type: String, default: '' },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['CREATED', 'PAID', 'FAILED', 'REFUND_INITIATED', 'REFUNDED'],
      default: 'CREATED',
    },
    refundId: { type: String, default: '' },
    refundInitiatedAt: { type: Date, default: null },
    refundNote: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
