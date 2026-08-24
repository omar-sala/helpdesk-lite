import { api } from './api'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type TicketCategory = 'TECHNICAL_ISSUE' | 'ACCOUNT_ACCESS' | 'BILLING' | 'SOFTWARE' | 'HARDWARE' | 'NETWORK' | 'GENERAL_INQUIRY'
export interface TicketUser { id: string; name: string; email: string; role: string }
export interface Ticket { id: string; title: string; description: string; category: TicketCategory; priority: TicketPriority; status: TicketStatus; createdAt: string; updatedAt: string; resolvedAt: string | null; requester: TicketUser; assignee: TicketUser | null }
export interface TicketActivity { id: string; type: string; message: string; createdAt: string; user: Pick<TicketUser, 'id' | 'name' | 'role'> }
export interface TicketPage { data: Ticket[]; page: number; limit: number; total: number; totalPages: number }
export interface CreateTicketDTO { title: string; description: string; category: TicketCategory; priority: TicketPriority }
export const ticketService = {
  getTickets: async (params?: Record<string, string | number | undefined>): Promise<TicketPage> => (await api.get('/tickets', { params })).data,
  getMyTickets: (params?: Record<string, string | number | undefined>) => ticketService.getTickets(params),
  getTicketById: async (id: string): Promise<Ticket> => (await api.get(`/tickets/${id}`)).data.data,
  createTicket: async (data: CreateTicketDTO): Promise<Ticket> => (await api.post('/tickets', data)).data.data,
  assignToSelf: async (id: string): Promise<Ticket> => (await api.post(`/tickets/${id}/assign-self`)).data.data,
  assignToAgent: async (id: string, assigneeId: string): Promise<Ticket> => (await api.post(`/tickets/${id}/assign`, { assigneeId })).data.data,
  updateTicket: async (id: string, updates: Partial<Pick<Ticket, 'title' | 'description' | 'category' | 'priority' | 'status'>>): Promise<Ticket> => (await api.patch(`/tickets/${id}`, updates)).data.data,
  getActivities: async (id: string): Promise<TicketActivity[]> => (await api.get(`/tickets/${id}/activities`)).data.data,
  addComment: async (id: string, message: string): Promise<TicketActivity> => (await api.post(`/tickets/${id}/activities`, { message })).data.data,
  getSummary: async () => (await api.get('/tickets/summary')).data.data,
}
