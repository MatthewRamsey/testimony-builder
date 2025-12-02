// Create a reusable mock Supabase client
const mockSelect = jest.fn().mockReturnThis()
const mockInsert = jest.fn().mockReturnThis()
const mockUpdate = jest.fn().mockReturnThis()
const mockDelete = jest.fn().mockReturnThis()
const mockEq = jest.fn().mockReturnThis()
const mockSingle = jest.fn()
const mockRange = jest.fn().mockReturnThis()
const mockOrder = jest.fn().mockReturnThis()

const mockFrom = jest.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
  single: mockSingle,
  range: mockRange,
  order: mockOrder,
}))

const mockAuth = {
  signInWithOtp: jest.fn(),
  exchangeCodeForSession: jest.fn(),
  verifyOtp: jest.fn(),
  getUser: jest.fn(),
  getSession: jest.fn(),
  signOut: jest.fn(),
}

export function createMockSupabaseClient() {
  return {
    from: mockFrom,
    auth: mockAuth,
  }
}

export function createMockSupabaseAuth() {
  return {
    signInWithOtp: jest.fn().mockResolvedValue({ data: {}, error: null }),
    exchangeCodeForSession: jest.fn().mockResolvedValue({
      data: { session: { user: { id: 'user-123' } } },
      error: null
    }),
    verifyOtp: jest.fn().mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null
    }),
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null
    }),
    getSession: jest.fn().mockResolvedValue({
      data: { session: { user: { id: 'user-123' } } },
      error: null
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  }
}

// Export the mock instances
export const mockSupabase = createMockSupabaseClient()

// Export mock functions for tests to use
export { mockFrom, mockAuth, mockSelect, mockInsert, mockUpdate, mockDelete, mockEq, mockSingle, mockOrder }
