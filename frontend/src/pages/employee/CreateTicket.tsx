import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketService } from '../../services/ticket.service'
import type { CreateTicketDTO } from '../../services/ticket.service'

export const CreateTicket: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<CreateTicketDTO>({
    title: '',
    description: '',
    category: 'TECHNICAL_ISSUE',
    priority: 'MEDIUM',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await ticketService.createTicket(formData)
      navigate('/employee/tickets')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create ticket.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800 rounded-lg text-white shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Create Support Ticket</h1>
      {error && (
        <div className="p-3 mb-4 bg-red-500/20 text-red-400 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            required
            minLength={5}
            maxLength={100}
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
            placeholder="Brief summary of the issue"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as any })
              }
              className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
            >
              <option value="TECHNICAL_ISSUE">Technical Issue</option>
              <option value="ACCOUNT_ACCESS">Account Access</option>
              <option value="BILLING">Billing</option>
              <option value="SOFTWARE">Software</option>
              <option value="HARDWARE">Hardware</option>
              <option value="NETWORK">Network</option>
              <option value="GENERAL_INQUIRY">General Inquiry</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value as any })
              }
              className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            required
            rows={5}
            minLength={10}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
            placeholder="Provide detailed information about your issue..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded font-semibold transition disabled:opacity-50"
        >
          {loading ? 'Submitting Ticket...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  )
}
