import express from 'express'
import cors from 'cors'
import { createRequire } from 'node:module'
import { authRouter } from './routes/auth.routes.js'
import { ticketRouter } from './routes/ticket.routes.js'
import { userRouter } from './routes/user.routes.js'
import { analyticsRouter } from './routes/analytics.routes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { AppError } from './utils/errors.js'

export function createApp() {
  const app = express()
  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'

  const require = createRequire(import.meta.url)
  const helmet = require('helmet')

  app.use(helmet())
  app.use(
    cors({
      origin: clientUrl.split(',').map((value) => value.trim()),
      credentials: true,
    })
  )
  app.use(express.json({ limit: '1mb' }))

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'HelpDesk Lite API is running on Vercel',
    })
  })

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok' } })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/tickets', ticketRouter)
  app.use('/api/users', userRouter)
  app.use('/api/analytics', analyticsRouter)

  app.use((_req, _res, next) => {
    next(new AppError('Route not found', 404))
  })
  app.use(errorHandler)
  return app
}
