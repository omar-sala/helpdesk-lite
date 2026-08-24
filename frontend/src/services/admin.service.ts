import { api } from './api'
import type { TicketUser } from './ticket.service'
export interface ManagedUser extends TicketUser { isActive: boolean; createdAt: string }
export const adminService = {
  agents: async (): Promise<TicketUser[]> => (await api.get('/users/agents')).data.data,
  users: async (): Promise<ManagedUser[]> => (await api.get('/users')).data.data,
  updateUser: async (id: string, data: { role?: string; isActive?: boolean }): Promise<ManagedUser> => (await api.patch(`/users/${id}`, data)).data.data,
  overview: async () => (await api.get('/analytics/overview')).data.data,
  status: async () => (await api.get('/analytics/status')).data.data,
  priority: async () => (await api.get('/analytics/priority')).data.data,
  agentsWorkload: async () => (await api.get('/analytics/agents')).data.data,
}
