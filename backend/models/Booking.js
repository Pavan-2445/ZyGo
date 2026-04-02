const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
    },
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'ACCEPTED', 'PAID', 'REJECTED', 'CANCELLED'],
      default: 'REQUESTED',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ rideId: 1, passengerId: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
