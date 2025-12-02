/**
 * @jest-environment node
 */
import { GET, POST } from '../../testimonies/route'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TestimonyService } from '@/domain/testimony/services/TestimonyService'
import { createTestTestimony } from '@/__tests__/fixtures/testimonies'
import { createTestUser } from '@/__tests__/fixtures/users'

jest.mock('@/lib/supabase/server')
jest.mock('@/domain/testimony/services/TestimonyService')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
}

describe('GET /api/testimonies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabase as any)
  })

  it('should return list of user testimonies when authenticated', async () => {
    const user = createTestUser()
    const testimonies = [
      createTestTestimony({ id: '1', user_id: user.id }),
      createTestTestimony({ id: '2', user_id: user.id }),
    ]

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    })

    const mockListByUser = jest.fn().mockResolvedValue(testimonies)
    ;(TestimonyService as jest.MockedClass<typeof TestimonyService>).prototype.listByUser = mockListByUser

    const request = new NextRequest('http://localhost:3000/api/testimonies')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(2)
    expect(data[0]).toMatchObject({
      id: '1',
      user_id: user.id,
      title: 'Test Testimony',
    })
    expect(mockListByUser).toHaveBeenCalledWith(user.id)
  })

  it('should return 401 when user not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' } as any,
    })

    const request = new NextRequest('http://localhost:3000/api/testimonies')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })

  it('should return 500 when service throws error', async () => {
    const user = createTestUser()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    })

    const mockListByUser = jest.fn().mockRejectedValue(new Error('Database error'))
    ;(TestimonyService as jest.MockedClass<typeof TestimonyService>).prototype.listByUser = mockListByUser

    const request = new NextRequest('http://localhost:3000/api/testimonies')
    const response = await GET(request)

    expect(response.status).toBe(500)
  })
})

describe('POST /api/testimonies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabase as any)
  })

  it('should create testimony when authenticated with valid data', async () => {
    const user = createTestUser()
    const testimonyData = {
      title: 'My New Testimony',
      framework_type: 'before_encounter_after' as const,
      content: {
        before: 'Before',
        encounter: 'Encounter',
        after: 'After',
      },
    }
    const createdTestimony = createTestTestimony({
      ...testimonyData,
      user_id: user.id,
    })

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    })

    const mockCreate = jest.fn().mockResolvedValue(createdTestimony)
    ;(TestimonyService as jest.MockedClass<typeof TestimonyService>).prototype.create = mockCreate

    const request = new NextRequest('http://localhost:3000/api/testimonies', {
      method: 'POST',
      body: JSON.stringify(testimonyData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toMatchObject({
      title: 'My New Testimony',
      framework_type: 'before_encounter_after',
      user_id: user.id,
    })
    expect(mockCreate).toHaveBeenCalledWith(user.id, testimonyData)
  })

  it('should return 401 when user not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' } as any,
    })

    const request = new NextRequest('http://localhost:3000/api/testimonies', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test',
        framework_type: 'before_encounter_after',
        content: {},
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('should return 400 when title is missing', async () => {
    const user = createTestUser()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/testimonies', {
      method: 'POST',
      body: JSON.stringify({
        framework_type: 'before_encounter_after',
        content: {},
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 when framework_type is invalid', async () => {
    const user = createTestUser()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/testimonies', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test',
        framework_type: 'invalid_type',
        content: {},
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })
})
