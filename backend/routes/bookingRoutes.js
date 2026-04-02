const express = require('express');
const {
  requestBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  getIncomingBookings,
  getPassengerBookings,
  getBookingById,
} = require('../controllers/bookingController');

const router = express.Router();

router.get('/incoming', getIncomingBookings);
router.get('/my', getPassengerBookings);
router.get('/:id', getBookingById);
router.post('/request', requestBooking);
router.post('/:id/accept', acceptBooking);
router.post('/:id/reject', rejectBooking);
router.post('/:id/cancel', cancelBooking);

module.exports = router;
