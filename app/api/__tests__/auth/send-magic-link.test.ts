/**
 * @jest-environment node
 */
import { POST } from '../../auth/send-magic-link/route'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/route-handler'

jest.mock('@/lib/supabase/route-handler')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockSupabase = {
  auth: {
    signInWithOtp: jest.fn(),
  },
}

describe('POST /api/auth/send-magic-link', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockReturnValue({
      supabase: mockSupabase as any,
      getResponse: jest.fn(() => ({ cookies: { getAll: () => [] } })),
    })
  })

  it('should return 200 when valid email provided', async () => {
    mockSupabase.auth.signInWithOtp.mockResolvedValue({
      data: {},
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/auth/send-magic-link', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true, message: 'Magic link sent' })
    expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'user@example.com',
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
  })

  it('should return 400 when email is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/send-magic-link', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 when email is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/send-magic-link', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 500 when Supabase returns error', async () => {
    mockSupabase.auth.signInWithOtp.mockResolvedValue({
      data: null,
      error: { message: 'Email service error' } as any,
    })

    const request = new NextRequest('http://localhost:3000/api/auth/send-magic-link', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
  })
})
