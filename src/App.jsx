import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import BottomNav from './components/Layout/BottomNav'

import LoginPage from './pages/Auth/LoginPage'
import SignupPage from './pages/Auth/SignupPage'
import TwoFactorPage from './pages/Auth/TwoFactorPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import TransactionsPage from './pages/Transactions/TransactionsPage'
import BudgetPage from './pages/Budget/BudgetPage'
import BillsPage from './pages/Bills/BillsPage'
import ReportsPage from './pages/Reports/ReportsPage'
import SettingsPage from './pages/Settings/SettingsPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner" />
  return user ? children : <Navigate to="/auth/login" replace />
}

function AppLayout() {
  const location = useLocation()
  const isAuth = location.pathname.startsWith('/auth')

  return (
    <div style={{display:'flex', flexDirection:'column', minHeight:'100vh'}}>
      <Routes>
        {/* Auth */}
        <Route path="/auth/login"    element={<LoginPage />} />
        <Route path="/auth/signup"   element={<SignupPage />} />
        <Route path="/auth/2fa"      element={<TwoFactorPage />} />
        <Route path="/auth/2fa-setup" element={<TwoFactorPage isSetup />} />

        {/* App */}
        <Route path="/"              element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/transactions"  element={<PrivateRoute><TransactionsPage /></PrivateRoute>} />
        <Route path="/budget"        element={<PrivateRoute><BudgetPage /></PrivateRoute>} />
        <Route path="/bills"         element={<PrivateRoute><BillsPage /></PrivateRoute>} />
        <Route path="/reports"       element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
        <Route path="/settings"      element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isAuth && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
