const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    source: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    stops: [{ type: String, required: true, trim: true }],
    dateTime: { type: Date, required: true },
    vehicleType: {
      type: String,
      enum: ['BIKE', 'CAR', 'SUV'],
      required: true,
    },
    seatsTotal: { type: Number, required: true, min: 1 },
    seatsAvailable: { type: Number, required: true, min: 0 },
    pricePerSeat: { type: Number, required: true, min: 0 },
    distance: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ride', rideSchema);
