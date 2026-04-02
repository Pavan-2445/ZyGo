# ZyGo RideShare

A polished full-stack ride-sharing platform inspired by BlaBlaCar, built with Spring Boot and React. Drivers can publish scheduled intercity rides, passengers can search by route order, send booking requests, pay after acceptance, and explore rides on a modern animated UI.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, React Router
- Backend: Spring Boot, Spring Data JPA, H2, Razorpay Java SDK
- Integrations: Google Maps Distance Matrix API, Google Maps JavaScript API, Razorpay Checkout + Orders API

## Product highlights

- Multi-step animated registration with identity preview
- Protected route-based app shell
- Personalized dashboard with upcoming rides and recent bookings
- Search, offer, ride details, bookings, and payment flows
- Google Maps route rendering on offer and ride detail pages
- Backend distance and duration calculation with live Google Maps support and safe local fallbacks
- Razorpay order creation and server-side signature verification
- Structured JSON error responses for cleaner frontend UX

## Frontend env

Create `frontend/.env` from [frontend/.env.example](d:/ZyGo/frontend/.env.example):

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Backend env

Set these in your terminal before starting Spring Boot when you want live integrations:

```powershell
$env:GOOGLE_MAPS_API_KEY="your_google_maps_key"
$env:RAZORPAY_KEY_ID="rzp_test_..."
$env:RAZORPAY_KEY_SECRET="your_razorpay_secret"
```

## Run locally

### Frontend

```powershell
cd d:\ZyGo\frontend
npm install
npm run dev
```

### Backend

```powershell
cd d:\ZyGo\backend
..\gradle-8.10.2\bin\gradle.bat bootRun
```

## Notes

- Without Google Maps keys, the backend uses seeded fallback metrics and the frontend shows a graceful Maps placeholder.
- Without Razorpay keys, the backend returns a mock order and the frontend completes a demo checkout path so the booking flow still works.
