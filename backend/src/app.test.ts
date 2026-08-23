import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from './app.js'

describe('health and auth guards', () => {
  const app = createApp()

  it('reports API health', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('rejects unauthenticated ticket access', async () => {
    const res = await request(app).get('/api/tickets')
    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('rejects unauthenticated analytics access', async () => {
    const res = await request(app).get('/api/analytics/overview')
    expect(res.status).toBe(401)
  })

  it('rejects unauthenticated user management', async () => {
    const res = await request(app).get('/api/users')
    expect(res.status).toBe(401)
  })
})
