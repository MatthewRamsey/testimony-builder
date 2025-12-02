/**
 * @jest-environment node
 */
import { GET } from '../../../auth/callback/route'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route-handler'

jest.mock('@/lib/supabase/route-handler')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockSupabase = {
  auth: {
    exchangeCodeForSession: jest.fn(),
  },
}
const mockGetResponse = jest.fn(() => {
  const response = NextResponse.next()
  // Mock cookies
  response.cookies.set = jest.fn()
  response.cookies.getAll = jest.fn(() => [])
  return response
})

describe('GET /auth/callback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockReturnValue({
      supabase: mockSupabase as any,
      getResponse: mockGetResponse,
    })
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
    const response = await GET(request)

    expect(response.status).toBe(307) // Redirect status
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard')
    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(code)
  })

  it('should redirect to login with error when code exchange fails', async () => {
    const code = 'invalid-code'
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Invalid code' } as any,
    })

    const request = new NextRequest(`http://localhost:3000/auth/callback?code=${code}`)
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login?error=invalid_token')
    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(code)
  })

  it('should redirect to login when no code provided', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback')
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login?error=invalid_token')
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
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(`http://localhost:3000${next}`)
    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(code)
  })
})
