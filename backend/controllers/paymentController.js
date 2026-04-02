const Razorpay = require('razorpay');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error('Razorpay keys are not configured.');
    error.statusCode = 500;
    throw error;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('rideId');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found.');
    }

    if (booking.status !== 'ACCEPTED') {
      res.status(400);
      throw new Error('Payment is only allowed after booking acceptance.');
    }

    const razorpay = getRazorpayClient();
    const options = {
      amount: Math.round(booking.rideId.pricePerSeat * 100),
      currency: 'INR',
      receipt: `booking_${booking._id}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.findOneAndUpdate(
      { bookingId },
      {
        bookingId,
        orderId: order.id,
        amount: booking.rideId.pricePerSeat,
        status: 'CREATED',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ orderId: order.id, amount: options.amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    next(error);
  }
};

const paymentSuccess = async (req, res, next) => {
  try {
    const orderId = req.body.orderId || req.body.razorpayOrderId;
    const paymentId = req.body.paymentId || req.body.razorpayPaymentId;

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      res.status(404);
      throw new Error('Payment record not found.');
    }

    const booking = await Booking.findById(payment.bookingId);
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found.');
    }

    if (booking.status !== 'ACCEPTED') {
      res.status(400);
      throw new Error('Booking is not eligible for payment confirmation.');
    }

    payment.paymentId = paymentId;
    payment.status = 'PAID';
    booking.status = 'PAID';

    await Promise.all([payment.save(), booking.save()]);

    res.json({ message: 'Payment recorded successfully.', booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  paymentSuccess,
};
