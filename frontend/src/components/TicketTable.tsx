import React from 'react'
import { StatusBadge, PriorityBadge } from './Badges'
import { Clock, MessageSquare, ExternalLink } from 'lucide-react'

export interface TicketItem {
  id: string
  title: string
  status: string
  priority: string
  createdAt: string
  createdBy?: { name: string }
  assignedTo?: { name: string }
}

interface Props {
  tickets: TicketItem[]
  onSelect: (id: string) => void
}

export const TicketTable: React.FC<Props> = ({ tickets, onSelect }) => {
  if (tickets.length === 0) {
    return (
      <div className="glass-card p-12 text-center text-slate-400">
        <MessageSquare className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <p className="text-lg font-medium">لا توجد تذاكر حالياً</p>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm text-slate-300">
          <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-700/60 font-medium">
            <tr>
              <th className="p-4">العنوان</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">الأولوية</th>
              <th className="p-4">المُنشئ</th>
              <th className="p-4">المسؤول</th>
              <th className="p-4">التاريخ</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {tickets.map((t) => (
              <tr
                key={t.id}
                onClick={() => onSelect(t.id)}
                className="hover:bg-slate-700/30 transition-colors cursor-pointer group"
              >
                <td className="p-4 font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                  {t.title}
                </td>
                <td className="p-4">
                  <StatusBadge status={t.status} />
                </td>
                <td className="p-4">
                  <PriorityBadge priority={t.priority} />
                </td>
                <td className="p-4 text-slate-400">
                  {t.createdBy?.name || 'غير معروف'}
                </td>
                <td className="p-4 text-slate-400">
                  {t.assignedTo?.name || 'غير معيّن'}
                </td>
                <td className="p-4 text-slate-400 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(t.createdAt).toLocaleDateString('ar-EG')}
                  </div>
                </td>
                <td className="p-4 text-slate-500 group-hover:text-indigo-400">
                  <ExternalLink className="w-4 h-4" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
