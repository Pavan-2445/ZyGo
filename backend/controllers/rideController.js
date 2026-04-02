const Ride = require('../models/Ride');
const User = require('../models/User');
const { calculateRouteDistance, calculatePricePerSeat, normalize } = require('../config/rideUtils');

const baseRate = Number(process.env.BASE_RATE || 4.5);

const sanitizeStops = (source, intermediateStops = [], destination) => {
  const route = [source, ...intermediateStops, destination]
    .map((stop) => String(stop || '').trim())
    .filter(Boolean);

  return route.filter((stop, index) => {
    if (index === 0) return true;
    return normalize(route[index - 1]) !== normalize(stop);
  });
};

const createRide = async (req, res, next) => {
  try {
    const { driverId, source, destination, stops = [], dateTime, vehicleType, seatsTotal } = req.body;

    const driver = await User.findById(driverId);
    if (!driver) {
      res.status(404);
      throw new Error('Driver not found.');
    }

    const route = sanitizeStops(source, stops, destination);
    const sourceIndex = route.findIndex((stop) => normalize(stop) === normalize(source));
    const destinationIndex = route.findIndex((stop) => normalize(stop) === normalize(destination));

    if (sourceIndex === -1 || destinationIndex === -1 || sourceIndex >= destinationIndex) {
      res.status(400);
      throw new Error('Route must contain source before destination.');
    }

    const distance = calculateRouteDistance(route);
    const pricePerSeat = calculatePricePerSeat({
      distance,
      vehicleType,
      seatsTotal: Number(seatsTotal),
      baseRate,
    });

    const ride = await Ride.create({
      driverId,
      source,
      destination,
      stops: route,
      dateTime,
      vehicleType,
      seatsTotal,
      seatsAvailable: seatsTotal,
      pricePerSeat,
      distance,
    });

    const populatedRide = await Ride.findById(ride._id).populate('driverId');
    res.status(201).json(populatedRide);
  } catch (error) {
    next(error);
  }
};

const getRideById = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('driverId');
    if (!ride) {
      res.status(404);
      throw new Error('Ride not found.');
    }

    res.json(ride);
  } catch (error) {
    next(error);
  }
};

const searchRides = async (req, res, next) => {
  try {
    const from = req.query.from || req.query.source;
    const to = req.query.to || req.query.destination;

    if (!from || !to) {
      res.status(400);
      throw new Error('from/source and to/destination are required.');
    }

    const rides = await Ride.find({ seatsAvailable: { $gt: 0 } }).populate('driverId').sort({ dateTime: 1 });

    const matched = rides.filter((ride) => {
      const fromIndex = ride.stops.findIndex((stop) => normalize(stop) === normalize(from));
      const toIndex = ride.stops.findIndex((stop) => normalize(stop) === normalize(to));
      return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
    });

    res.json(matched);
  } catch (error) {
    next(error);
  }
};

const listRides = async (req, res, next) => {
  try {
    const rides = await Ride.find().populate('driverId').sort({ dateTime: 1 });
    res.json(rides);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRide,
  getRideById,
  searchRides,
  listRides,
};
