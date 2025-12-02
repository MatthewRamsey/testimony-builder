import { ITestimonyRepository } from '../repositories/ITestimonyRepository'
import { Testimony, CreateTestimonyDto, UpdateTestimonyDto, FrameworkType } from '../types'
import { ValidationError, AuthorizationError, NotFoundError } from '@/lib/errors'
import { z } from 'zod'

const frameworkTypes: FrameworkType[] = [
  'before_encounter_after',
  'life_timeline',
  'seasons_of_growth',
  'free_form',
]

const createTestimonySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  framework_type: z.enum([
    'before_encounter_after',
    'life_timeline',
    'seasons_of_growth',
    'free_form',
  ] as const),
  content: z.record(z.any()),
})

export class TestimonyService {
  constructor(private repository: ITestimonyRepository) {}

  async create(userId: string, data: CreateTestimonyDto): Promise<Testimony> {
    // Validate input
    const validationResult = createTestimonySchema.safeParse(data)
    if (!validationResult.success) {
      const fields: Record<string, string> = {}
      validationResult.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          fields[err.path[0].toString()] = err.message
        }
      })
      throw new ValidationError('Invalid testimony data', fields)
    }

    // Validate framework type
    if (!frameworkTypes.includes(data.framework_type)) {
      throw new ValidationError('Invalid framework type')
    }

    // Validate content structure based on framework
    this.validateContentStructure(data.framework_type, data.content)

    return this.repository.create({
      ...data,
      user_id: userId,
    })
  }

  async getById(userId: string, testimonyId: string): Promise<Testimony> {
    const testimony = await this.repository.findById(testimonyId)

    if (!testimony) {
      throw new NotFoundError('Testimony not found')
    }

    // Check authorization - users can only access their own testimonies
    // unless it's public (for gallery)
    if (testimony.user_id !== userId && !testimony.is_public) {
      throw new AuthorizationError('Not authorized to access this testimony')
    }

    return testimony
  }

  async update(userId: string, testimonyId: string, data: UpdateTestimonyDto): Promise<Testimony> {
    // Check if testimony exists and user owns it
    const existing = await this.repository.findById(testimonyId)
    if (!existing) {
      throw new NotFoundError('Testimony not found')
    }

    if (existing.user_id !== userId) {
      throw new AuthorizationError('Not authorized to update this testimony')
    }

    // Validate content structure if content is being updated
    if (data.content && existing.framework_type) {
      this.validateContentStructure(existing.framework_type, data.content)
    }

    return this.repository.update(testimonyId, data)
  }

  async delete(userId: string, testimonyId: string): Promise<void> {
    // Check if testimony exists and user owns it
    const existing = await this.repository.findById(testimonyId)
    if (!existing) {
      throw new NotFoundError('Testimony not found')
    }

    if (existing.user_id !== userId) {
      throw new AuthorizationError('Not authorized to delete this testimony')
    }

    await this.repository.delete(testimonyId)
  }

  async listByUser(userId: string): Promise<Testimony[]> {
    return this.repository.findByUserId(userId)
  }

  private validateContentStructure(framework: FrameworkType, content: any): void {
    switch (framework) {
      case 'before_encounter_after':
        if (!content.before || !content.encounter || !content.after) {
          throw new ValidationError(
            'Content must have before, encounter, and after fields'
          )
        }
        break
      case 'life_timeline':
        if (!Array.isArray(content.milestones)) {
          throw new ValidationError('Content must have a milestones array')
        }
        break
      case 'seasons_of_growth':
        if (!Array.isArray(content.seasons)) {
          throw new ValidationError('Content must have a seasons array')
        }
        break
      case 'free_form':
        if (typeof content.narrative !== 'string') {
          throw new ValidationError('Content must have a narrative field')
        }
        break
      default:
        throw new ValidationError('Invalid framework type')
    }
  }
}

