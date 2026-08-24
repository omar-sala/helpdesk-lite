import React from 'react'

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    OPEN: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    CLOSED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  }

  const labels: Record<string, string> = {
    OPEN: 'مفتوحة',
    IN_PROGRESS: 'قيد التنفيذ',
    RESOLVED: 'تم الحل',
    CLOSED: 'مغلقة',
  }

  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] || styles.OPEN}`}
    >
      {labels[status] || status}
    </span>
  )
}

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const styles: Record<string, string> = {
    LOW: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    MEDIUM: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    URGENT: 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse',
  }

  return (
    <span
      className={`px-2.5 py-0.5 text-xs font-medium rounded border ${styles[priority] || styles.LOW}`}
    >
      {priority}
    </span>
  )
}
