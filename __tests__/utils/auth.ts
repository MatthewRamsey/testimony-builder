import { createTestUser } from '../fixtures/users'

export function createMockAuthContext(userId?: string, email?: string) {
  const user = createTestUser({
    id: userId || 'user-123',
    email: email || 'test@example.com',
  })

  return {
    user,
    session: {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      user,
    },
  }
}

export function mockAuthenticatedRequest(userId?: string) {
  const authContext = createMockAuthContext(userId)

  return {
    headers: {
      authorization: `Bearer ${authContext.session.access_token}`,
    },
    cookies: {
      'sb-access-token': authContext.session.access_token,
      'sb-refresh-token': authContext.session.refresh_token,
    },
    user: authContext.user,
  }
}

export function mockUnauthenticatedRequest() {
  return {
    headers: {},
    cookies: {},
    user: null,
  }
}
