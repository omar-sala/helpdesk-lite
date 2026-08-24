import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { CreateTicket } from './pages/employee/CreateTicket'
import { MyTickets } from './pages/employee/MyTickets'
import { AgentDashboard } from './pages/agent/AgentDashboard'
import { ManagerDashboard } from './pages/manager/ManagerDashboard'
import { Users } from './pages/manager/Users'
import { TicketDetails, TicketList } from './pages/shared/TicketWorkspace'
function Home() { const { user } = useAuth(); return <Navigate to={user?.role === 'MANAGER' ? '/manager' : user?.role === 'AGENT' ? '/agent' : '/employee'} replace /> }
export default function App() { return <AuthProvider><BrowserRouter><Routes><Route path="/login" element={<Login />} /><Route element={<ProtectedRoute />}><Route element={<AppLayout />}><Route path="/" element={<Home />} /><Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}><Route path="/employee" element={<Navigate to="/employee/tickets" replace />} /><Route path="/employee/tickets" element={<MyTickets />} /><Route path="/employee/tickets/:id" element={<TicketDetails />} /><Route path="/employee/create-ticket" element={<CreateTicket />} /></Route><Route element={<ProtectedRoute allowedRoles={['AGENT']} />}><Route path="/agent" element={<AgentDashboard />} /><Route path="/agent/tickets" element={<TicketList title="Agent queue" />} /><Route path="/agent/tickets/:id" element={<TicketDetails />} /></Route><Route element={<ProtectedRoute allowedRoles={['MANAGER']} />}><Route path="/manager" element={<ManagerDashboard />} /><Route path="/manager/tickets" element={<TicketList title="All tickets" />} /><Route path="/manager/tickets/:id" element={<TicketDetails />} /><Route path="/manager/users" element={<Users />} /></Route></Route></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></BrowserRouter></AuthProvider> }
