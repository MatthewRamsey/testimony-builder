import { SupabaseTestimonyRepository } from '../supabase/repositories/SupabaseTestimonyRepository'
import { createTestTestimony } from '@/__tests__/fixtures/testimonies'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockFrom = jest.fn()

const mockSupabase = {
  from: mockFrom,
}

describe('SupabaseTestimonyRepository', () => {
  let repository: SupabaseTestimonyRepository

  beforeEach(() => {
    repository = new SupabaseTestimonyRepository()
    mockCreateClient.mockResolvedValue(mockSupabase as any)
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should persist testimony to database', async () => {
      const testimonyData = {
        user_id: 'user-123',
        title: 'My Testimony',
        framework_type: 'before_encounter_after' as const,
        content: {
          before: 'Before',
          encounter: 'Encounter',
          after: 'After',
        },
      }
      const createdTestimony = createTestTestimony(testimonyData)

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: createdTestimony,
              error: null,
            }),
          }),
        }),
      } as any)

      const result = await repository.create(testimonyData)

      expect(result).toEqual(createdTestimony)
      expect(mockSupabase.from).toHaveBeenCalledWith('testimonies')
    })

    it('should throw error when database insert fails', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      } as any)

      await expect(
        repository.create({
          user_id: 'user-123',
          title: 'Test',
          framework_type: 'before_encounter_after',
          content: {},
        })
      ).rejects.toThrow()
    })
  })

  describe('findById', () => {
    it('should return testimony from database', async () => {
      const testimonyId = 'testimony-456'
      const expectedTestimony = createTestTestimony({ id: testimonyId })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: expectedTestimony,
              error: null,
            }),
          }),
        }),
      } as any)

      const result = await repository.findById(testimonyId)

      expect(result).toEqual(expectedTestimony)
    })

    it('should return null when testimony not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'Not found' },
            }),
          }),
        }),
      } as any)

      const result = await repository.findById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    it('should update testimony in database', async () => {
      const testimonyId = 'testimony-456'
      const updateData = { title: 'Updated Title' }
      const updatedTestimony = createTestTestimony({
        id: testimonyId,
        ...updateData,
      })

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedTestimony,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await repository.update(testimonyId, updateData)

      expect(result.title).toBe('Updated Title')
    })

    it('should throw error when update fails', async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' },
              }),
            }),
          }),
        }),
      } as any)

      await expect(
        repository.update('testimony-456', { title: 'Updated' })
      ).rejects.toThrow()
    })
  })

  describe('delete', () => {
    it('should delete testimony from database', async () => {
      const testimonyId = 'testimony-456'

      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      } as any)

      await repository.delete(testimonyId)

      expect(mockSupabase.from).toHaveBeenCalledWith('testimonies')
    })

    it('should throw error when delete fails', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Delete failed' },
          }),
        }),
      } as any)

      await expect(repository.delete('testimony-456')).rejects.toThrow()
    })
  })

  describe('findByUserId', () => {
    it('should return all testimonies for user', async () => {
      const userId = 'user-123'
      const testimonies = [
        createTestTestimony({ id: '1', user_id: userId }),
        createTestTestimony({ id: '2', user_id: userId }),
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: testimonies,
              error: null,
            }),
          }),
        }),
      } as any)

      const result = await repository.findByUserId(userId)

      expect(result).toEqual(testimonies)
      expect(result.length).toBe(2)
    })

    it('should return empty array when user has no testimonies', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      } as any)

      const result = await repository.findByUserId('user-123')

      expect(result).toEqual([])
    })
  })
})
