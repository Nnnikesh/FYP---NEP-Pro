import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { LanguageProvider } from './components/LanguageToggle.jsx'
import { ThemeProvider } from './components/ThemeProvider.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import MainLayout from './Layouts/MainLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import MarketplacePage from './pages/MarketplacePage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import HelpPage from './pages/HelpPage.jsx'
import VendorProfilePage from './pages/VendorProfilePage.jsx'
import VendorDashboard from './pages/VendorDashboard.jsx'
import ClientDashboard from './pages/ClientDashboard.jsx'
import BookingPage from './pages/BookingPage.jsx'
import BudgetPlanner from './pages/BudgetPlanner.jsx'
import LoginPage from './Auth/LoginPage.jsx'
import RegistrationPage from './Auth/RegistrationPage.jsx'
import AdminLoginPage from './Auth/AdminLoginPage.jsx'
import AdminPortfolioPhotos from './pages/AdminPortfolioPhotos.jsx'
import PaymentSuccess from './pages/PaymentSuccess.jsx'
import PaymentFailure from './pages/PaymentFailure.jsx'
import PaymentPage from './pages/PaymentPage.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ScrollToTop />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<RegistrationPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              {/* Payment callback pages — outside MainLayout so no nav chrome */}
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-failure" element={<PaymentFailure />} />
              <Route
                path="/payment/:bookingId"
                element={
                  <ProtectedRoute roles={['host']}>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/vendor/:id" element={<VendorProfilePage />} />
                <Route path="/budget" element={<BudgetPlanner />} />
                <Route
                  path="/dashboard/vendor"
                  element={
                    <ProtectedRoute roles={['vendor']}>
                      <VendorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/client"
                  element={
                    <ProtectedRoute roles={['host']}>
                      <ClientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking/:vendorId"
                  element={
                    <ProtectedRoute roles={['host']}>
                      <BookingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/portfolio-photos"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminPortfolioPhotos />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
