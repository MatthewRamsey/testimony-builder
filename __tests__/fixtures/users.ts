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

export function createOtherUser(): TestUser {
  return createTestUser({
    id: 'user-456',
    email: 'other@example.com'
  })
}

export const mockUsers = {
  default: createTestUser(),
  other: createOtherUser()
}
