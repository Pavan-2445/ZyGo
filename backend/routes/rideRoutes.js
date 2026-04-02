const express = require('express');
const { createRide, getRideById, searchRides, listRides } = require('../controllers/rideController');

const router = express.Router();

router.get('/search', searchRides);
router.get('/:id', getRideById);
router.get('/', listRides);
router.post('/', createRide);

module.exports = router;
