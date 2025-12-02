import { TestimonyService } from '../services/TestimonyService'
import { ITestimonyRepository } from '../repositories/ITestimonyRepository'
import {
  createTestTestimony,
  createTestTestimonyDto,
} from '@/__tests__/fixtures/testimonies'
import { createTestUser, createOtherUser } from '@/__tests__/fixtures/users'

describe('TestimonyService', () => {
  let testimonyService: TestimonyService
  let mockRepository: jest.Mocked<ITestimonyRepository>

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any

    testimonyService = new TestimonyService(mockRepository)
  })

  describe('create', () => {
    it('should create testimony with valid data', async () => {
      const userId = 'user-123'
      const testimonyDto = createTestTestimonyDto()
      const expectedTestimony = createTestTestimony({ user_id: userId })

      mockRepository.create.mockResolvedValue(expectedTestimony)

      const result = await testimonyService.create(userId, testimonyDto)

      expect(result).toEqual(expectedTestimony)
      expect(mockRepository.create).toHaveBeenCalledWith({
        user_id: userId,
        ...testimonyDto,
      })
    })

    it('should throw error when title is empty', async () => {
      const invalidDto = createTestTestimonyDto({ title: '' })

      await expect(
        testimonyService.create('user-123', invalidDto)
      ).rejects.toThrow()
    })

    it('should throw error when framework is invalid', async () => {
      const invalidDto = {
        title: 'Test',
        framework_type: 'invalid-framework' as any,
        content: {},
      }

      await expect(
        testimonyService.create('user-123', invalidDto)
      ).rejects.toThrow()
    })

    it('should create testimony with life_timeline framework', async () => {
      const userId = 'user-123'
      const testimonyDto = createTestTestimonyDto({
        framework_type: 'life_timeline',
        content: {
          milestones: [
            { age: '20', event: 'Event 1', impact: 'Impact 1' },
          ],
        },
      })
      const expectedTestimony = createTestTestimony({
        user_id: userId,
        framework_type: 'life_timeline',
        content: testimonyDto.content,
      })

      mockRepository.create.mockResolvedValue(expectedTestimony)

      const result = await testimonyService.create(userId, testimonyDto)

      expect(result.framework_type).toBe('life_timeline')
      expect(mockRepository.create).toHaveBeenCalled()
    })
  })

  describe('getById', () => {
    it('should return testimony when user owns it', async () => {
      const userId = 'user-123'
      const testimonyId = 'testimony-456'
      const expectedTestimony = createTestTestimony({
        id: testimonyId,
        user_id: userId,
      })

      mockRepository.findById.mockResolvedValue(expectedTestimony)

      const result = await testimonyService.getById(userId, testimonyId)

      expect(result).toEqual(expectedTestimony)
      expect(mockRepository.findById).toHaveBeenCalledWith(testimonyId)
    })

    it('should throw error when user does not own testimony', async () => {
      const userId = 'user-123'
      const otherUserId = 'user-789'
      const testimonyId = 'testimony-456'
      const otherUserTestimony = createTestTestimony({
        id: testimonyId,
        user_id: otherUserId,
      })

      mockRepository.findById.mockResolvedValue(otherUserTestimony)

      await expect(
        testimonyService.getById(userId, testimonyId)
      ).rejects.toThrow('Not authorized')
    })

    it('should throw error when testimony does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(
        testimonyService.getById('user-123', 'non-existent')
      ).rejects.toThrow('Testimony not found')
    })
  })

  describe('update', () => {
    it('should update testimony when user owns it', async () => {
      const userId = 'user-123'
      const testimonyId = 'testimony-456'
      const updateData = { title: 'Updated Title' }
      const existingTestimony = createTestTestimony({
        id: testimonyId,
        user_id: userId,
      })
      const updatedTestimony = { ...existingTestimony, ...updateData }

      mockRepository.findById.mockResolvedValue(existingTestimony)
      mockRepository.update.mockResolvedValue(updatedTestimony)

      const result = await testimonyService.update(
        userId,
        testimonyId,
        updateData
      )

      expect(result.title).toBe('Updated Title')
      expect(mockRepository.update).toHaveBeenCalledWith(
        testimonyId,
        updateData
      )
    })

    it('should throw error when user does not own testimony', async () => {
      const otherUserTestimony = createTestTestimony({
        id: 'testimony-456',
        user_id: 'other-user',
      })

      mockRepository.findById.mockResolvedValue(otherUserTestimony)

      await expect(
        testimonyService.update('user-123', 'testimony-456', {
          title: 'Updated',
        })
      ).rejects.toThrow('Not authorized')
    })

    it('should update content when provided', async () => {
      const userId = 'user-123'
      const testimonyId = 'testimony-456'
      const updateData = {
        content: {
          before: 'New before',
          encounter: 'New encounter',
          after: 'New after',
        },
      }
      const existingTestimony = createTestTestimony({
        id: testimonyId,
        user_id: userId,
      })

      mockRepository.findById.mockResolvedValue(existingTestimony)
      mockRepository.update.mockResolvedValue({
        ...existingTestimony,
        ...updateData,
      })

      const result = await testimonyService.update(
        userId,
        testimonyId,
        updateData
      )

      expect(result.content).toEqual(updateData.content)
    })
  })

  describe('delete', () => {
    it('should delete testimony when user owns it', async () => {
      const userId = 'user-123'
      const testimonyId = 'testimony-456'
      const existingTestimony = createTestTestimony({
        id: testimonyId,
        user_id: userId,
      })

      mockRepository.findById.mockResolvedValue(existingTestimony)
      mockRepository.delete.mockResolvedValue(undefined)

      await testimonyService.delete(userId, testimonyId)

      expect(mockRepository.delete).toHaveBeenCalledWith(testimonyId)
    })

    it('should throw error when user does not own testimony', async () => {
      const otherUserTestimony = createTestTestimony({
        id: 'testimony-456',
        user_id: 'other-user',
      })

      mockRepository.findById.mockResolvedValue(otherUserTestimony)

      await expect(
        testimonyService.delete('user-123', 'testimony-456')
      ).rejects.toThrow('Not authorized')
    })

    it('should throw error when testimony does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(
        testimonyService.delete('user-123', 'non-existent')
      ).rejects.toThrow('Testimony not found')
    })
  })

  describe('listByUser', () => {
    it('should return only testimonies owned by user', async () => {
      const userId = 'user-123'
      const userTestimonies = [
        createTestTestimony({ id: '1', user_id: userId }),
        createTestTestimony({ id: '2', user_id: userId }),
      ]

      mockRepository.findByUserId.mockResolvedValue(userTestimonies)

      const result = await testimonyService.listByUser(userId)

      expect(result).toEqual(userTestimonies)
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId)
    })

    it('should return empty array when user has no testimonies', async () => {
      mockRepository.findByUserId.mockResolvedValue([])

      const result = await testimonyService.listByUser('user-123')

      expect(result).toEqual([])
    })

    it('should not include other users testimonies', async () => {
      const userId = 'user-123'
      const userTestimonies = [
        createTestTestimony({ id: '1', user_id: userId }),
      ]

      mockRepository.findByUserId.mockResolvedValue(userTestimonies)

      const result = await testimonyService.listByUser(userId)

      expect(result.every((t) => t.user_id === userId)).toBe(true)
    })
  })
})
