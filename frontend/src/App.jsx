import { AnimatePresence } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import PageTransition from './components/PageTransition'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import HomePage from './pages/app/HomePage'
import SearchPage from './pages/app/SearchPage'
import OfferRidePage from './pages/app/OfferRidePage'
import RideDetailsPage from './pages/app/RideDetailsPage'
import BookingsPage from './pages/app/BookingsPage'
import PaymentPage from './pages/app/PaymentPage'

export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        </Route>

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/home" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
          <Route path="/offer-ride" element={<PageTransition><OfferRidePage /></PageTransition>} />
          <Route path="/ride/:id" element={<PageTransition><RideDetailsPage /></PageTransition>} />
          <Route path="/bookings" element={<PageTransition><BookingsPage /></PageTransition>} />
          <Route path="/payment" element={<PageTransition><PaymentPage /></PageTransition>} />
        </Route>

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
