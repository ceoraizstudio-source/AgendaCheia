import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Pipeline from './pages/Pipeline'
import Messaging from './pages/Messaging'
import Analytics from './pages/Analytics'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import Services from './pages/Services'

function PrivateRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/messaging" element={<Messaging />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/services" element={<Services />} />
        </Route>
        <Route path="/" element={<Navigate to="/pipeline" replace />} />
        <Route path="*" element={<Navigate to="/pipeline" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
