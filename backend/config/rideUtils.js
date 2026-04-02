const cityCoordinates = {
  hyderabad: [17.385, 78.4867],
  nalgonda: [17.0575, 79.2684],
  guntur: [16.3067, 80.4365],
  vijayawada: [16.5062, 80.648],
  bza: [16.5062, 80.648],
  khammam: [17.2473, 80.1514],
  ongole: [15.5057, 80.0499],
  chirala: [15.823, 80.3522],
  warangal: [17.9689, 79.5941],
  eluru: [16.7107, 81.0952],
  rajahmundry: [16.9891, 81.7787],
  delhi: [28.6139, 77.209],
  mumbai: [19.076, 72.8777],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  pune: [18.5204, 73.8567],
  ahmedabad: [23.0225, 72.5714],
  jaipur: [26.9124, 75.7873],
  guwahati: [26.1445, 91.7362],
  bhopal: [23.2599, 77.4126],
  kochi: [9.9312, 76.2673],
  visakhapatnam: [17.6868, 83.2185],
  vizag: [17.6868, 83.2185],
  tirupati: [13.6288, 79.4192],
};

const vehicleMultipliers = {
  BIKE: 1,
  CAR: 1.5,
  SUV: 2,
};

const normalize = (value = '') => value.trim().toLowerCase();

const getCoordinates = (city = '') => {
  const normalized = normalize(city);
  if (cityCoordinates[normalized]) {
    return cityCoordinates[normalized];
  }

  const seed = Array.from(normalized).reduce((total, char) => total + char.charCodeAt(0), 0);
  const lat = 8 + ((seed % 2500) / 100);
  const lng = 68 + (((seed + 37) % 3000) / 100);
  return [Number(lat.toFixed(4)), Number(lng.toFixed(4))];
};

const haversineDistance = (coordsA, coordsB) => {
  const [lat1, lon1] = coordsA;
  const [lat2, lon2] = coordsB;
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateRouteDistance = (stops = []) => {
  let total = 0;
  for (let index = 0; index < stops.length - 1; index += 1) {
    total += haversineDistance(getCoordinates(stops[index]), getCoordinates(stops[index + 1]));
  }
  return Number(total.toFixed(2));
};

const calculatePricePerSeat = ({ distance, vehicleType, seatsTotal, baseRate }) => {
  const multiplier = vehicleMultipliers[vehicleType] || vehicleMultipliers.CAR;
  return Number(((distance * baseRate * multiplier) / seatsTotal).toFixed(2));
};

module.exports = {
  normalize,
  getCoordinates,
  calculateRouteDistance,
  calculatePricePerSeat,
  vehicleMultipliers,
};
