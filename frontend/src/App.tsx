import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { CreateTicket } from './pages/employee/CreateTicket'
import { MyTickets } from './pages/employee/MyTickets'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Employee Routes */}
          <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
            <Route
              path="/employee"
              element={<Navigate to="/employee/tickets" replace />}
            />
            <Route path="/employee/tickets" element={<MyTickets />} />
            <Route path="/employee/create-ticket" element={<CreateTicket />} />
            <Route path="/employee/dashboard" element={<MyTickets />} />
          </Route>

          {/* Default Redirection */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
