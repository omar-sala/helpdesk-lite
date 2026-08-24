import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
export function AppLayout() { return <div className="min-h-screen bg-slate-950 text-slate-100"><Navbar /><main className="mx-auto max-w-7xl p-4 sm:p-6"><Outlet /></main></div> }
