import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Home from './pages/Home.jsx'
import AuthPage from './pages/AuthPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import { useEffect } from 'react'
import { openedFromRecoveryLink } from './lib/supabase.js'
import Intro from './components/Intro.jsx'
import CursorFX from './components/CursorFX.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminRedirect />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function RecoveryGate() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!openedFromRecoveryLink) return
    const t = setTimeout(() => navigate('/reset', { replace: true }), 60)
    return () => clearTimeout(t)
  }, [navigate])
  return null
}

function AdminRedirect() {
  return <Dashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <Intro />
      <CursorFX />
      <HashRouter>
        <RecoveryGate />
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  )
}
