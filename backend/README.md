# ZyGo RideShare Backend

Production-style backend for a ride-sharing application using Node.js, Express, MongoDB Atlas, Mongoose, and Razorpay.

## Stack

- Node.js
- Express.js
- MongoDB Atlas via Mongoose
- Razorpay test mode
- dotenv
- CORS

## Structure

backend/
- models/
- controllers/
- routes/
- config/
- middleware/
- server.js
- .env

## Environment variables

```env
PORT=5000
MONGO_URI=<MongoDB Atlas connection string>
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
BASE_RATE=4.5
```

## Install and run

```powershell
cd d:\ZyGo\backend
npm install
npm start
```

For development:

```powershell
npm run dev
```

## Core APIs

### Auth
- `GET /api/auth/identity/:aadhaarId`
- `GET /api/auth/users/:userId`
- `POST /api/auth/register`
- `POST /api/auth/login`

### Rides
- `POST /api/rides`
- `GET /api/rides`
- `GET /api/rides/:id`
- `GET /api/rides/search?from=Hyderabad&to=Guntur`

### Bookings
- `POST /api/bookings/request`
- `GET /api/bookings/incoming?driverId=<userId>`
- `GET /api/bookings/my?passengerId=<userId>`
- `GET /api/bookings/:id`
- `POST /api/bookings/:id/accept`
- `POST /api/bookings/:id/reject`

### Payments
- `POST /api/payments/create-order`
- `POST /api/payments/success`

Compatibility aliases are also exposed for the current frontend:
- `POST /api/payments/intent`
- `POST /api/payments/:id/confirm`

## Notes

- Aadhaar auth is mock-based using hardcoded demo profiles in `config/mockProfiles.js`.
- MongoDB collections are auto-created by Mongoose.
- Distance uses the Haversine formula with city coordinate mapping and fallback coordinates.
- Duplicate booking requests, overbooking, unauthorized accepts, and early payments are blocked.
