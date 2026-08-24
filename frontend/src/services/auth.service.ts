import { api } from './api'

export interface LoginCredentials {
  email: string
  password?: string
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data.data // { token, user }
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data.data
  },
}
