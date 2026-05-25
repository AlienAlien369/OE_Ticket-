import { http, HttpResponse, delay } from 'msw'
import type { User } from '@/types/index'

// No base prefix — match exactly what Axios sends
const mockUser: User = {
  id: 'usr_01hx1f',
  email: 'admin@oeticket.dev',
  name: 'Admin User',
  username: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  roles: ['default'],
  accessiblePages: ['new-token', 'print'],
  permissions: [],
}

const mockAccessToken = 'mock_access_token_' + Date.now()

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    await delay(800)
    const body = await request.json() as { usernameOrEmail: string; password: string }
    if (body.password.length < 8) {
      return HttpResponse.json(
        { success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS', statusCode: 401 },
        { status: 401 }
      )
    }
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: mockAccessToken,
        username: mockUser.username,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        roles: mockUser.roles,
        accessiblePages: mockUser.accessiblePages,
      }
    })
  }),

  http.post('/api/auth/register', async () => {
    await delay(1000)
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: mockAccessToken,
        username: mockUser.username,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        roles: mockUser.roles,
        accessiblePages: mockUser.accessiblePages,
      }
    })
  }),

  http.post('/api/auth/logout', async () => {
    await delay(200)
    return HttpResponse.json({ success: true })
  }),

  http.post('/api/auth/forgot-password', async () => {
    await delay(600)
    return HttpResponse.json({ success: true, data: { message: 'Reset email sent' } })
  }),
]