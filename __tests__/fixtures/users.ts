export interface TestUser {
  id: string
  email: string
  created_at: Date
}

export function createTestUser(overrides?: Partial<TestUser>): TestUser {
  return {
    id: 'user-123',
    email: 'test@example.com',
    created_at: new Date('2024-01-01'),
    ...overrides
  }
}

export function createPremiumUser(): TestUser {
  return createTestUser({
    id: 'premium-user-123',
    email: 'premium@example.com'
  })
}

export function createOtherUser(): TestUser {
  return createTestUser({
    id: 'user-456',
    email: 'other@example.com'
  })
}

export const mockUsers = {
  default: createTestUser(),
  premium: createPremiumUser(),
  other: createOtherUser()
}
