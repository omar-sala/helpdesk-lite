import { api } from './api'

export interface CreateTicketDTO {
  title: string
  description: string
  category:
    | 'TECHNICAL_ISSUE'
    | 'ACCOUNT_ACCESS'
    | 'BILLING'
    | 'SOFTWARE'
    | 'HARDWARE'
    | 'NETWORK'
    | 'GENERAL_INQUIRY'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export const ticketService = {
  // جلب التيكتس الخاصة بالموظف أو الكل للـ Agent/Manager
  getTickets: async (params?: Record<string, any>) => {
    const response = await api.get('/tickets', { params })
    return response.data.data // 💡 فك كائن data المباشر
  },

  // إضـافـة اسم getMyTickets كـ alias أو دالة تعيد نفس النتيجة لـ MyTickets.tsx
  getMyTickets: async (params?: Record<string, any>) => {
    const response = await api.get('/tickets', { params })
    return response.data.data // 💡 فك كائن data المباشر
  },

  // جلب تفاصيل تيكت واحدة بالـ History
  getTicketById: async (id: string) => {
    const response = await api.get(`/tickets/${id}`)
    return response.data.data
  },

  // إنشاء تيكت جديدة
  createTicket: async (data: CreateTicketDTO) => {
    const response = await api.post('/tickets', data)
    return response.data.data
  },

  // Assign to Me (للـ Agent)
  assignTicket: async (ticketId: string) => {
    const response = await api.patch(`/tickets/${ticketId}/assign`)
    return response.data.data
  },

  // تغيير الحالة (للـ Agent / Manager)
  updateStatus: async (ticketId: string, status: string) => {
    const response = await api.patch(`/tickets/${ticketId}/status`, { status })
    return response.data.data
  },
}
