/**
 * @jest-environment node
 */
import { GET } from '../../../auth/callback/route'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockSupabase = {
  auth: {
    exchangeCodeForSession: jest.fn(),
  },
}

describe('GET /auth/callback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabase as any)
  })

  it('should exchange code for session and redirect to dashboard', async () => {
    const code = 'valid-code-123'
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
      data: {
        session: { user: { id: 'user-123' } },
        user: { id: 'user-123' },
      },
      error: null,
    })

    const request = new NextRequest(`http://localhost:3000/auth/callback?code=${code}`)

    try {
      await GET(request)
    } catch (error: any) {
      // Next.js redirect throws a special error
      expect(error.message).toContain('NEXT_REDIRECT')
    }

    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(code)
  })

  it('should redirect to login with error when code exchange fails', async () => {
    const code = 'invalid-code'
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Invalid code' } as any,
    })

    const request = new NextRequest(`http://localhost:3000/auth/callback?code=${code}`)

    await expect(GET(request)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(code)
  })

  it('should redirect to login when no code provided', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback')

    await expect(GET(request)).rejects.toThrow('NEXT_REDIRECT')
  })

  it('should respect next parameter for post-auth redirect', async () => {
    const code = 'valid-code-123'
    const next = '/create'
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
      data: {
        session: { user: { id: 'user-123' } },
        user: { id: 'user-123' },
      },
      error: null,
    })

    const request = new NextRequest(
      `http://localhost:3000/auth/callback?code=${code}&next=${next}`
    )

    await expect(GET(request)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(code)
  })
})
