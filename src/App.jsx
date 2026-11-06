import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Home from './pages/Home.jsx'
import AuthPage from './pages/AuthPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
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
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  )
}
