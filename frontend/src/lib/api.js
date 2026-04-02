const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

const withId = (value) => {
  if (!isObject(value)) return value
  if (value._id && !value.id) {
    return { ...value, id: String(value._id) }
  }
  return value
}

const normalizeUser = (user) => {
  const normalized = withId(user)
  if (!isObject(normalized)) return normalized
  return {
    ...normalized,
    id: normalized.id || '',
  }
}

const normalizeRide = (ride) => {
  const normalized = withId(ride)
  if (!isObject(normalized)) return normalized

  const driver = isObject(normalized.driverId) ? normalizeUser(normalized.driverId) : null
  const route = Array.isArray(normalized.route)
    ? normalized.route
    : Array.isArray(normalized.stops)
      ? normalized.stops
      : []

  return {
    ...normalized,
    id: normalized.id || '',
    driverId: driver?.id || (normalized.driverId ? String(normalized.driverId) : ''),
    driverName: normalized.driverName || driver?.name || '',
    route,
    distanceKm: Number(normalized.distanceKm ?? normalized.distance ?? 0),
    durationMinutes: Number(normalized.durationMinutes ?? 0),
  }
}

const normalizeBooking = (booking) => {
  const normalized = withId(booking)
  if (!isObject(normalized)) return normalized

  const ride = isObject(normalized.rideId) ? normalizeRide(normalized.rideId) : null
  const passenger = isObject(normalized.passengerId) ? normalizeUser(normalized.passengerId) : null

  return {
    ...normalized,
    id: normalized.id || '',
    rideId: ride?.id || (normalized.rideId ? String(normalized.rideId) : ''),
    passengerId: passenger?.id || (normalized.passengerId ? String(normalized.passengerId) : ''),
    passengerName: normalized.passengerName || passenger?.name || '',
    driverId: normalized.driverId || ride?.driverId || '',
    driverName: normalized.driverName || ride?.driverName || '',
    route: Array.isArray(normalized.route) ? normalized.route : ride?.route || [],
    routeSummary: normalized.routeSummary || (ride ? `${ride.source} to ${ride.destination}` : 'Ride booking'),
    rideDateTime: normalized.rideDateTime || ride?.dateTime || null,
    pricePerSeat: Number(normalized.pricePerSeat ?? ride?.pricePerSeat ?? 0),
    seatsAvailable: Number(normalized.seatsAvailable ?? ride?.seatsAvailable ?? 0),
    hoursUntilRide: Number(normalized.hoursUntilRide ?? 0),
    canCancel: Boolean(normalized.canCancel),
    refundInitiated: Boolean(normalized.refundInitiated),
    supportEmail: normalized.supportEmail || 'support@zygo.in',
    refundNote: normalized.refundNote || normalized.cancellationReason || '',
  }
}

const normalizePayment = (payment) => {
  const normalized = withId(payment)
  if (!isObject(normalized)) return normalized

  const rawAmount = Number(normalized.amount ?? 0)
  const amount = rawAmount > 999 ? rawAmount / 100 : rawAmount

  return {
    ...normalized,
    id: normalized.id || normalized.orderId || normalized.providerOrderId || '',
    providerOrderId: normalized.providerOrderId || normalized.orderId || '',
    publicKey: normalized.publicKey || normalized.keyId || '',
    amount,
  }
}

const normalizeResponse = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeResponse)
  }

  if (!isObject(value)) {
    return value
  }

  if ('bookingId' in value && ('orderId' in value || 'providerOrderId' in value || 'keyId' in value || 'publicKey' in value)) {
    return normalizePayment(value)
  }

  if ('status' in value && 'rideId' in value && 'passengerId' in value) {
    return normalizeBooking(value)
  }

  if ('source' in value && 'destination' in value && ('driverId' in value || 'stops' in value || 'route' in value)) {
    return normalizeRide(value)
  }

  if ('aadhaarId' in value && 'name' in value) {
    return normalizeUser(value)
  }

  const normalized = withId(value)
  return Object.fromEntries(Object.entries(normalized).map(([key, entry]) => [key, normalizeResponse(entry)]))
}

const mapAuthPayload = (payload = {}) => ({
  aadhaarId: payload.aadhaarId || payload.aadhaarMockId || '',
  phone: payload.phone || '',
  address: payload.address || '',
})

const mapRidePayload = (payload = {}) => ({
  driverId: payload.driverId,
  source: payload.source,
  destination: payload.destination,
  stops: Array.isArray(payload.stops) ? payload.stops : Array.isArray(payload.intermediateStops) ? payload.intermediateStops : [],
  dateTime: payload.dateTime,
  vehicleType: payload.vehicleType,
  seatsTotal: payload.seatsTotal,
  pricePerSeatOverride: payload.pricePerSeatOverride ?? null,
})

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    let message = 'Request failed'
    try {
      const data = await response.json()
      message = data.message || data.error || message
    } catch {
      const text = await response.text()
      if (text) message = text
    }
    throw new Error(message)
  }

  if (response.status === 204) return null
  const data = await response.json()
  return normalizeResponse(data)
}

export const api = {
  previewIdentity: (aadhaarMockId) => request(`/api/auth/identity/${aadhaarMockId}`),
  register: (payload) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(mapAuthPayload(payload)) }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(mapAuthPayload(payload)) }),
  getUser: (userId) => request(`/api/auth/users/${userId}`),
  createRide: (payload) => request('/api/rides', { method: 'POST', body: JSON.stringify(mapRidePayload(payload)) }),
  listRides: () => request('/api/rides'),
  getRide: (rideId) => request(`/api/rides/${rideId}`),
  searchRides: (source, destination) => request(`/api/rides/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`),
  requestBooking: (payload) => request('/api/bookings/request', { method: 'POST', body: JSON.stringify(payload) }),
  getIncomingBookings: (driverId) => request(`/api/bookings/incoming?driverId=${driverId}`),
  getMyBookings: (passengerId) => request(`/api/bookings/my?passengerId=${passengerId}`),
  getBooking: (bookingId) => request(`/api/bookings/${bookingId}`),
  acceptBooking: (bookingId, driverId) => request(`/api/bookings/${bookingId}/accept`, { method: 'POST', body: JSON.stringify({ driverId }) }),
  rejectBooking: (bookingId, driverId) => request(`/api/bookings/${bookingId}/reject`, { method: 'POST', body: JSON.stringify({ driverId }) }),
  cancelBooking: (bookingId, passengerId) => request(`/api/bookings/${bookingId}/cancel`, { method: 'POST', body: JSON.stringify({ passengerId }) }),
  createPaymentIntent: async (payload) => normalizePayment(await request('/api/payments/intent', { method: 'POST', body: JSON.stringify(payload) })),
  confirmPayment: (paymentId, payload) => request(`/api/payments/${paymentId}/confirm`, { method: 'POST', body: JSON.stringify(payload) }),
  getPaymentForBooking: (bookingId) => request(`/api/payments?bookingId=${bookingId}`),
}
