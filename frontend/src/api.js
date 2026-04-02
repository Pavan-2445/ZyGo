const API_BASE = 'http://localhost:8080/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Request failed')
  }

  if (response.status === 204) return null
  return response.json()
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  createRide: (payload) => request('/rides', { method: 'POST', body: JSON.stringify(payload) }),
  listRides: () => request('/rides'),
  searchRides: (source, destination) => request(`/rides/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`),
  requestBooking: (payload) => request('/bookings/request', { method: 'POST', body: JSON.stringify(payload) }),
  getIncomingBookings: (driverId) => request(`/bookings/incoming?driverId=${driverId}`),
  getMyBookings: (passengerId) => request(`/bookings/my?passengerId=${passengerId}`),
  acceptBooking: (bookingId, driverId) => request(`/bookings/${bookingId}/accept`, { method: 'POST', body: JSON.stringify({ driverId }) }),
  rejectBooking: (bookingId, driverId) => request(`/bookings/${bookingId}/reject`, { method: 'POST', body: JSON.stringify({ driverId }) }),
  createPaymentIntent: (payload) => request('/payments/intent', { method: 'POST', body: JSON.stringify(payload) }),
  confirmPayment: (paymentId, passengerId) => request(`/payments/${paymentId}/confirm`, { method: 'POST', body: JSON.stringify({ passengerId }) }),
}
