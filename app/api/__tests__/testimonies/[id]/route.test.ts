/**
 * @jest-environment node
 */
import { GET, PUT, DELETE } from '../../../testimonies/[id]/route'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TestimonyService } from '@/domain/testimony/services/TestimonyService'
import { createTestTestimony } from '@/__tests__/fixtures/testimonies'
import { createTestUser } from '@/__tests__/fixtures/users'
import { NotFoundError, AuthorizationError } from '@/lib/errors'

jest.mock('@/lib/supabase/server')
jest.mock('@/domain/testimony/services/TestimonyService')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
}

describe('GET /api/testimonies/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabase as any)
  })

  it('should return testimony when authenticated and authorized', async () => {
    const user = createTestUser()
    const testimony = createTestTestimony({ id: 'test-123', user_id: user.id })

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    })

    const mockGetById = jest.fn().mockResolvedValue(testimony)
    ;(TestimonyService as jest.MockedClass<typeof TestimonyService>).prototype.getById = mockGetById

    const request = new NextRequest('http://localhost:3000/api/testimonies/test-123')
    const response = await GET(request, { params: { id: 'test-123' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject({
      id: 'test-123',
      user_id: user.id,
      title: 'Test Testimony',
    })
    expect(mockGetById).toHaveBeenCalledWith(user.id, 'test-123')
  })

  it('should return 401 when user not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' } as any,
    })

    const request = new NextRequest('http://localhost:3000/api/testimonies/test-123')
    const response = await GET(request, { params: { id: 'test-123' } })

    expect(response.status).toBe(401)
  })

  it('should return 403 when user not authorized', async () => {
    const user = createTestUser()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    })

    const mockGetById = jest.fn().mockRejectedValue(new AuthorizationError('Not authorized'))
    ;(TestimonyService as jest.MockedClass<typeof TestimonyService>).prototype.getById = mockGetById

    const request = new NextRequest('http://localhost:3000/api/testimonies/test-123')
    const response = await GET(request, { params: { id: 'test-123' } })

    expect(response.status).toBe(403)
  })

  it('should return 404 when testimony not found', async () => {
    const user = createTestUser()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    })

    const mockGetById = jest.fn().mockRejectedValue(new NotFoundError('Testimony not found'))
    ;(TestimonyService as jest.MockedClass<typeof TestimonyService>).prototype.getById = mockGetById

    const request = new NextRequest('http://localhost:3000/api/testimonies/test-123')
    const response = await GET(request, { params: { id: 'test-123' } })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/testimonies/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabase as any)
  })

  it('should update testimony when authenticated and authorized', async () => {
    const user = createTestUser()
    const updateData = { title: 'Updated Title' }
    const updatedTestimony = createTestTestimony({
      id: 'test-123',
      user_id: user.id,
      ...updateData,
    })

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    })

    const mockUpdate = jest.fn().mockResolvedValue(updatedTestimony)
    ;(TestimonyService as jest.MockedClass<typeof TestimonyService>).prototype.update = mockUpdate

    const request = new NextRequest('http://localhost:3000/api/testimonies/test-123', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })

    const response = await PUT(request, { params: { id: 'test-123' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject({
      id: 'test-123',
      user_id: user.id,
      title: 'Updated Title',
    })
    expect(mockUpdate).toHaveBeenCalledWith(user.id, 'test-123', updateData)
  })

  it('should return 401 when user not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' } as any,
    })

    const request = new NextRequest('http://localhost:3000/api/testimonies/test-123', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated' }),
    })

    const response = await PUT(request, { params: { id: 'test-123' } })

    expect(response.status).toBe(401)
  })

  it('should return 403 when user not authorized', async () => {
    const user = createTestUser()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    })

    const mockUpdate = jest.fn().mockRejectedValue(new AuthorizationError('Not authorized'))
    ;(TestimonyService as jest.MockedClass<typeof TestimonyService>).prototype.update = mockUpdate

    const request = new NextRequest('http://localhost:3000/api/testimonies/test-123', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated' }),
    })

    const response = await PUT(request, { params: { id: 'test-123' } })

    expect(response.status).toBe(403)
  })

  it('should return 404 when testimony not found', async () => {
    const user = createTestUser()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    })

    const mockUpdate = jest.fn().mockRejectedValue(new NotFoundError('Testimony not found'))
    ;(TestimonyService as jest.MockedClass<typeof TestimonyService>).prototype.update = mockUpdate

    const request = new NextRequest('http://localhost:3000/api/testimonies/test-123', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated' }),
    })

    const response = await PUT(request, { params: { id: 'test-123' } })

    expect(response.status).toBe(404)
  })
})

describe('DELETE /api/testimonies/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabase as any)
  })

  it('should delete testimony when authenticated and authorized', async () => {
    const user = createTestUser()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    })

    const mockDelete = jest.fn().mockResolvedValue(undefined)
    ;(TestimonyService as jest.MockedClass<typeof TestimonyService>).prototype.delete = mockDelete

    const request = new NextRequest('http://localhost:3000/api/testimonies/test-123', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: { id: 'test-123' } })

    expect(response.status).toBe(204)
    expect(mockDelete).toHaveBeenCalledWith(user.id, 'test-123')
  })

  it('should return 401 when user not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' } as any,
    })

    const request = new NextRequest('http://localhost:3000/api/testimonies/test-123', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: { id: 'test-123' } })

    expect(response.status).toBe(401)
  })

  it('should return 403 when user not authorized', async () => {
    const user = createTestUser()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    })

    const mockDelete = jest.fn().mockRejectedValue(new AuthorizationError('Not authorized'))
    ;(TestimonyService as jest.MockedClass<typeof TestimonyService>).prototype.delete = mockDelete

    const request = new NextRequest('http://localhost:3000/api/testimonies/test-123', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: { id: 'test-123' } })

    expect(response.status).toBe(403)
  })

  it('should return 404 when testimony not found', async () => {
    const user = createTestUser()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    })

    const mockDelete = jest.fn().mockRejectedValue(new NotFoundError('Testimony not found'))
    ;(TestimonyService as jest.MockedClass<typeof TestimonyService>).prototype.delete = mockDelete

    const request = new NextRequest('http://localhost:3000/api/testimonies/test-123', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: { id: 'test-123' } })

    expect(response.status).toBe(404)
  })
})
