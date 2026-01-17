/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { getAuthUser, requireAuth } from '@/lib/auth/middleware'
import { TestimonyService } from '@/domain/testimony/services/TestimonyService'
import { createTestTestimony } from '@/__tests__/fixtures/testimonies'
import { createTestUser } from '@/__tests__/fixtures/users'

jest.mock('@/lib/auth/middleware')
jest.mock('@/domain/testimony/services/TestimonyService')
jest.mock('nanoid', () => ({ nanoid: () => 'test-share-token' }))

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>
const mockGetAuthUser = getAuthUser as jest.MockedFunction<typeof getAuthUser>

import { GET, POST } from '../../testimonies/route'

describe('GET /api/testimonies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return list of user testimonies when authenticated', async () => {
    const user = createTestUser()
    const testimonies = [
      createTestTestimony({ id: '1', user_id: user.id }),
      createTestTestimony({ id: '2', user_id: user.id }),
    ]

    mockRequireAuth.mockResolvedValue(user as any)

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
    const { AuthenticationError } = await import('@/lib/errors')
    mockRequireAuth.mockRejectedValue(new AuthenticationError('Authentication required'))

    const request = new NextRequest('http://localhost:3000/api/testimonies')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })

  it('should return 500 when service throws error', async () => {
    const user = createTestUser()
    mockRequireAuth.mockResolvedValue(user as any)
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    const mockListByUser = jest.fn().mockRejectedValue(new Error('Database error'))
    ;(TestimonyService as jest.MockedClass<typeof TestimonyService>).prototype.listByUser = mockListByUser

    const request = new NextRequest('http://localhost:3000/api/testimonies')
    const response = await GET(request)

    expect(response.status).toBe(500)
    consoleSpy.mockRestore()
  })
})

describe('POST /api/testimonies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
      share_token: 'test-share-token',
      user_id: user.id,
    })

    mockGetAuthUser.mockResolvedValue(user as any)

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
    expect(mockCreate).toHaveBeenCalledWith(user.id, {
      ...testimonyData,
      is_public: false,
      share_token: 'test-share-token',
    })
  })

  it('should return 401 when user not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null)

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
    mockGetAuthUser.mockResolvedValue(user as any)

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
    mockGetAuthUser.mockResolvedValue(user as any)

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
