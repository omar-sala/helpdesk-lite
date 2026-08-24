import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { AppError, unauthorized } from '../utils/errors.js'
import { signToken } from '../utils/jwt.js'

const publicUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const

export async function registerUser(input: {
  name: string
  email: string
  password: string
}) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  })
  if (existing) {
    throw new AppError('An account with this email already exists', 409)
  }

  const passwordHash = await bcrypt.hash(input.password, 12)
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'EMPLOYEE',
    },
    select: publicUser,
  })

  const token = signToken({ sub: user.id, role: user.role, email: user.email })
  return { user, token }
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user) throw unauthorized('Invalid email or password')
  if (!user.isActive) throw unauthorized('This account has been deactivated')

  const ok = await bcrypt.compare(input.password, user.passwordHash)
  if (!ok) throw unauthorized('Invalid email or password')

  const token = signToken({ sub: user.id, role: user.role, email: user.email })
  const { passwordHash: _ignored, ...safe } = user
  return { user: safe, token }
}

export async function getCurrentUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: publicUser,
  })
  if (!user) throw unauthorized()
  return user
}
