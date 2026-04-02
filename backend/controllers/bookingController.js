const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const User = require('../models/User');
const Payment = require('../models/Payment');

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@zygo.in';
const CANCELLATION_WINDOW_HOURS = 24;

const populateBooking = (query) => query.populate('rideId').populate('passengerId');

const assertObjectId = (value, fieldName, res) => {
  if (!value || !mongoose.isValidObjectId(value)) {
    res.status(400);
    throw new Error(`${fieldName} is required and must be a valid id.`);
  }
};

const hoursUntilRide = (dateTime) => (new Date(dateTime).getTime() - Date.now()) / (1000 * 60 * 60);

const serializeBooking = async (bookingDoc) => {
  if (!bookingDoc) return null;

  const booking = typeof bookingDoc.toObject === 'function' ? bookingDoc.toObject() : bookingDoc;
  const payment = await Payment.findOne({ bookingId: booking._id }).lean();
  const hoursLeft = booking.rideId?.dateTime ? hoursUntilRide(booking.rideId.dateTime) : null;

  return {
    ...booking,
    supportEmail: SUPPORT_EMAIL,
    paymentStatus: payment?.status || '',
    refundInitiated: payment?.status === 'REFUND_INITIATED' || payment?.status === 'REFUNDED',
    refundNote: payment?.refundNote || '',
    canCancel: ['REQUESTED', 'ACCEPTED', 'PAID'].includes(booking.status) && hoursLeft !== null && hoursLeft >= CANCELLATION_WINDOW_HOURS,
    cancellationWindowHours: CANCELLATION_WINDOW_HOURS,
    hoursUntilRide: hoursLeft,
  };
};

const serializeBookings = async (bookingDocs) => Promise.all(bookingDocs.map(serializeBooking));

const requestBooking = async (req, res, next) => {
  try {
    const { rideId, passengerId } = req.body;

    assertObjectId(rideId, 'rideId', res);
    assertObjectId(passengerId, 'passengerId', res);

    const [ride, passenger] = await Promise.all([
      Ride.findById(rideId),
      User.findById(passengerId),
    ]);

    if (!ride) {
      res.status(404);
      throw new Error('Ride not found.');
    }

    if (!passenger) {
      res.status(404);
      throw new Error('Passenger not found.');
    }

    if (String(ride.driverId) === String(passengerId)) {
      res.status(400);
      throw new Error('Driver cannot request their own ride.');
    }

    if (ride.seatsAvailable <= 0) {
      res.status(400);
      throw new Error('No seats available for this ride.');
    }

    const existingBooking = await Booking.findOne({
      rideId,
      passengerId,
      status: { $in: ['REQUESTED', 'ACCEPTED', 'PAID'] },
    });

    if (existingBooking) {
      res.status(400);
      throw new Error('Duplicate booking request is not allowed.');
    }

    const booking = await Booking.create({ rideId, passengerId, status: 'REQUESTED' });
    const populatedBooking = await populateBooking(Booking.findById(booking._id));
    res.status(201).json(await serializeBooking(populatedBooking));
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      return next(new Error('Duplicate booking request is not allowed.'));
    }
    next(error);
  }
};

const acceptBooking = async (req, res, next) => {
  try {
    const { driverId } = req.body;

    assertObjectId(req.params.id, 'bookingId', res);
    assertObjectId(driverId, 'driverId', res);

    const booking = await populateBooking(Booking.findById(req.params.id));

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found.');
    }

    if (String(booking.rideId.driverId) !== String(driverId)) {
      res.status(403);
      throw new Error('Only the ride driver can accept this booking.');
    }

    if (booking.status !== 'REQUESTED') {
      res.status(400);
      throw new Error('Only requested bookings can be accepted.');
    }

    const ride = await Ride.findById(booking.rideId._id);
    if (!ride || ride.seatsAvailable <= 0) {
      res.status(400);
      throw new Error('No seats available to accept this booking.');
    }

    ride.seatsAvailable -= 1;
    booking.status = 'ACCEPTED';

    await Promise.all([ride.save(), booking.save()]);
    const updatedBooking = await populateBooking(Booking.findById(booking._id));
    res.json(await serializeBooking(updatedBooking));
  } catch (error) {
    next(error);
  }
};

const rejectBooking = async (req, res, next) => {
  try {
    const { driverId } = req.body;

    assertObjectId(req.params.id, 'bookingId', res);
    assertObjectId(driverId, 'driverId', res);

    const booking = await populateBooking(Booking.findById(req.params.id));

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found.');
    }

    if (String(booking.rideId.driverId) !== String(driverId)) {
      res.status(403);
      throw new Error('Only the ride driver can reject this booking.');
    }

    booking.status = 'REJECTED';
    await booking.save();

    res.json(await serializeBooking(booking));
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const { passengerId } = req.body;

    assertObjectId(req.params.id, 'bookingId', res);
    assertObjectId(passengerId, 'passengerId', res);

    const booking = await populateBooking(Booking.findById(req.params.id));
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found.');
    }

    if (String(booking.passengerId._id) !== String(passengerId)) {
      res.status(403);
      throw new Error('Only the passenger who booked the ride can cancel it.');
    }

    if (!['REQUESTED', 'ACCEPTED', 'PAID'].includes(booking.status)) {
      res.status(400);
      throw new Error('This booking can no longer be cancelled.');
    }

    const hoursLeft = hoursUntilRide(booking.rideId.dateTime);
    if (hoursLeft < CANCELLATION_WINDOW_HOURS) {
      res.status(400);
      throw new Error('Bookings cannot be cancelled within 24 hours of ride start.');
    }

    const ride = await Ride.findById(booking.rideId._id);
    const payment = await Payment.findOne({ bookingId: booking._id });
    const wasPaid = payment?.status === 'PAID';

    if (ride && ['ACCEPTED', 'PAID'].includes(booking.status)) {
      ride.seatsAvailable += 1;
    }

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date();
    booking.cancellationReason = wasPaid
      ? `Refund initiated. Contact ${SUPPORT_EMAIL} for support.`
      : `Ride cancelled successfully. Contact ${SUPPORT_EMAIL} for support.`;

    if (wasPaid) {
      payment.status = 'REFUND_INITIATED';
      payment.refundInitiatedAt = new Date();
      payment.refundNote = `Refund initiated after passenger cancellation. Contact ${SUPPORT_EMAIL}.`;
    }

    await Promise.all([
      ride ? ride.save() : Promise.resolve(),
      payment ? payment.save() : Promise.resolve(),
      booking.save(),
    ]);

    const updatedBooking = await populateBooking(Booking.findById(booking._id));
    res.json({
      booking: await serializeBooking(updatedBooking),
      refundInitiated: wasPaid,
      supportEmail: SUPPORT_EMAIL,
      message: wasPaid
        ? `Cancellation successful. Refund has been initiated. Contact ${SUPPORT_EMAIL} for help.`
        : `Cancellation successful. Contact ${SUPPORT_EMAIL} for help if needed.`,
    });
  } catch (error) {
    next(error);
  }
};

const getIncomingBookings = async (req, res, next) => {
  try {
    const { driverId } = req.query;
    assertObjectId(driverId, 'driverId', res);

    const rides = await Ride.find({ driverId }).select('_id');
    const rideIds = rides.map((ride) => ride._id);
    const bookings = await populateBooking(Booking.find({ rideId: { $in: rideIds } }).sort({ createdAt: -1 }));
    res.json(await serializeBookings(bookings));
  } catch (error) {
    next(error);
  }
};

const getPassengerBookings = async (req, res, next) => {
  try {
    const { passengerId } = req.query;
    assertObjectId(passengerId, 'passengerId', res);

    const bookings = await populateBooking(Booking.find({ passengerId }).sort({ createdAt: -1 }));
    res.json(await serializeBookings(bookings));
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    assertObjectId(req.params.id, 'bookingId', res);

    const booking = await populateBooking(Booking.findById(req.params.id));
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found.');
    }

    res.json(await serializeBooking(booking));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  getIncomingBookings,
  getPassengerBookings,
  getBookingById,
};
