import { Testimony, CreateTestimonyDto, FrameworkType } from '@/domain/testimony/types'

export function createTestTestimony(overrides?: Partial<Testimony>): Testimony {
  return {
    id: 'testimony-123',
    user_id: 'user-123',
    title: 'Test Testimony',
    framework_type: 'before_encounter_after',
    content: {
      before: 'Before my encounter',
      encounter: 'The encounter',
      after: 'After the encounter'
    },
    is_public: false,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    ...overrides
  }
}

export function createTestTestimonyDto(overrides?: Partial<CreateTestimonyDto>): CreateTestimonyDto {
  return {
    title: 'Test Testimony',
    framework_type: 'before_encounter_after',
    content: {
      before: 'Before my encounter',
      encounter: 'The encounter',
      after: 'After the encounter'
    },
    ...overrides
  }
}

export function createLifeTimelineTestimony(): Testimony {
  return createTestTestimony({
    framework_type: 'life_timeline',
    content: {
      milestones: [
        {
          age: '20',
          event: 'First event',
          impact: 'Major impact'
        },
        {
          age: '25',
          event: 'Second event',
          impact: 'Another impact'
        }
      ]
    }
  })
}

export function createSeasonsOfGrowthTestimony(): Testimony {
  return createTestTestimony({
    framework_type: 'seasons_of_growth',
    content: {
      seasons: [
        {
          season: 'Spring',
          challenges: 'Growth challenges',
          growth: 'Personal growth',
          lessons: 'Lessons learned'
        }
      ]
    }
  })
}

export function createFreeFormTestimony(): Testimony {
  return createTestTestimony({
    framework_type: 'free_form',
    content: {
      narrative: 'This is my free-form testimony narrative.'
    }
  })
}

export const mockTestimonies = {
  beforeEncounterAfter: createTestTestimony(),
  lifeTimeline: createLifeTimelineTestimony(),
  seasonsOfGrowth: createSeasonsOfGrowthTestimony(),
  freeForm: createFreeFormTestimony()
}
