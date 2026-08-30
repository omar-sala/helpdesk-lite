import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/auth.service'
import {
  Lock,
  Mail,
  Ticket,
  AlertCircle,
  Shield,
  UserCheck,
  User,
} from 'lucide-react'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setError('')
    setLoading(true)
    try {
      const data = await authService.login({
        email: loginEmail,
        password: loginPass,
      })
      login(data.token, data.user)

      if (data.user.role === 'MANAGER') navigate('/manager')
      else if (data.user.role === 'AGENT') navigate('/agent')
      else navigate('/employee')
    } catch (err: any) {
      setError(err.response?.data?.message || 'بيانات الدخول غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeLogin(email, password)
  }

  const handleDemoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    executeLogin(demoEmail, demoPass)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 border border-slate-700/80">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-3">
            <Ticket className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">تسجيل الدخول</h2>
          <p className="text-slate-400 text-sm mt-1">
            نظام إدارة التذاكر والدعم الفني
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 mt-2"
          >
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>

        {/* Quick Demo Credentials Section */}
        <div className="mt-8 pt-6 border-t border-slate-700/60">
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            تجربة سريعة (Quick Demo Login)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleDemoLogin('admin@northwind.test', 'Password123!')
              }
              className="flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-all disabled:opacity-50"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Manager</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleDemoLogin('agent@northwind.test', 'Password123!')
              }
              className="flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Agent</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleDemoLogin('employee@northwind.test', 'Password123!')
              }
              className="flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all disabled:opacity-50"
            >
              <User className="w-3.5 h-3.5" />
              <span>Employee</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
