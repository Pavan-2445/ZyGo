const express = require('express');
const { createOrder, paymentSuccess } = require('../controllers/paymentController');

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/success', paymentSuccess);
router.post('/intent', createOrder);
router.post('/:id/confirm', paymentSuccess);

module.exports = router;
