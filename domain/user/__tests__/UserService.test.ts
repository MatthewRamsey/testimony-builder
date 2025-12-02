import { UserService } from '../services/UserService'
import { createTestUser } from '@/__tests__/fixtures/users'
import { createClient } from '@/lib/supabase/server'

// Mock the Supabase client
jest.mock('@/lib/supabase/server')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockSupabase = {
  auth: {
    signInWithOtp: jest.fn(),
    verifyOtp: jest.fn(),
    getUser: jest.fn(),
  },
}

describe('UserService', () => {
  let userService: UserService

  beforeEach(() => {
    userService = new UserService()
    mockCreateClient.mockResolvedValue(mockSupabase as any)
    jest.clearAllMocks()
  })

  describe('sendMagicLink', () => {
    it('should send magic link email when valid email provided', async () => {
      const email = 'user@example.com'
      mockSupabase.auth.signInWithOtp.mockResolvedValue({
        data: {},
        error: null,
      })

      await userService.sendMagicLink(email)

      expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      })
    })

    it('should throw error when email is invalid', async () => {
      const invalidEmail = 'not-an-email'

      await expect(userService.sendMagicLink(invalidEmail)).rejects.toThrow(
        'Invalid email address'
      )
    })

    it('should throw error when email is empty', async () => {
      await expect(userService.sendMagicLink('')).rejects.toThrow(
        'Invalid email address'
      )
    })

    it('should throw error when Supabase returns error', async () => {
      const email = 'user@example.com'
      mockSupabase.auth.signInWithOtp.mockResolvedValue({
        data: null,
        error: { message: 'Email service error' },
      })

      await expect(userService.sendMagicLink(email)).rejects.toThrow(
        'Failed to send magic link'
      )
    })
  })

  describe('verifyMagicLinkToken', () => {
    it('should authenticate user when valid token provided', async () => {
      const token = 'valid-token'
      const expectedUser = createTestUser()
      mockSupabase.auth.verifyOtp.mockResolvedValue({
        data: { user: expectedUser },
        error: null,
      })

      const user = await userService.verifyMagicLinkToken(token)

      expect(user).toEqual(expectedUser)
      expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
        token_hash: token,
        type: 'email',
      })
    })

    it('should throw error when token is invalid', async () => {
      const invalidToken = 'invalid-token'
      mockSupabase.auth.verifyOtp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      })

      await expect(
        userService.verifyMagicLinkToken(invalidToken)
      ).rejects.toThrow('Invalid or expired token')
    })

    it('should throw error when no user returned', async () => {
      const token = 'valid-token'
      mockSupabase.auth.verifyOtp.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      await expect(userService.verifyMagicLinkToken(token)).rejects.toThrow(
        'Invalid token'
      )
    })
  })

  describe('getCurrentUser', () => {
    it('should return authenticated user', async () => {
      const expectedUser = createTestUser()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: expectedUser },
        error: null,
      })

      const user = await userService.getCurrentUser()

      expect(user).toEqual(expectedUser)
    })

    it('should return null when no user authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const user = await userService.getCurrentUser()

      expect(user).toBeNull()
    })

    it('should return null when error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' },
      })

      const user = await userService.getCurrentUser()

      expect(user).toBeNull()
    })
  })
})
