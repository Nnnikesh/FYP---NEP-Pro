import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './components/LanguageToggle.jsx'
import { ThemeProvider } from './components/ThemeProvider.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import MainLayout from './Layouts/MainLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import MarketplacePage from './pages/MarketplacePage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import HelpPage from './pages/HelpPage.jsx'
import LoginPage from './Auth/LoginPage.jsx'
import RegistrationPage from './Auth/RegistrationPage.jsx'

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
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<RegistrationPage />} />
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminPage />
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
