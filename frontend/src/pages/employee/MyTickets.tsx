import React, { useEffect, useState } from 'react'
import { ticketService } from '../../services/ticket.service'
import { Link } from 'react-router-dom'

export const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ticketService
      .getMyTickets()
      .then((data) => setTickets(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="p-6 text-white text-center">Loading your tickets...</div>
    )

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Tickets</h1>
        <Link
          to="/employee/create-ticket"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold"
        >
          + Create Ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="p-8 bg-slate-800 text-center rounded text-slate-400">
          No tickets submitted yet.
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-700 text-slate-300">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-750">
                  <td className="p-4 font-medium">{t.title}</td>
                  <td className="p-4">{t.category}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        t.priority === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400'
                          : t.priority === 'HIGH'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-slate-600'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
