import React from 'react'
import { useAuth } from '../context/AuthContext'
import { LogOut, Ticket, Shield, User as UserIcon } from 'lucide-react'

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth()

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'MANAGER':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
      case 'AGENT':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    }
  }

  return (
    <nav className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-600/30">
              <Ticket className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              HelpDesk Lite
            </span>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-200">
                  {user.name}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${getRoleBadge(user.role)}`}
                >
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
