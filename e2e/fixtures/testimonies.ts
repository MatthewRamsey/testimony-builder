/**
 * Test fixtures for testimony data
 */

export const mockTestimonies = {
  beforeEncounterAfter: {
    id: 'test-bea-123',
    user_id: 'user-123',
    title: 'My Journey of Faith',
    framework_type: 'before_encounter_after' as const,
    content: {
      before: 'I was lost and searching for meaning in my life.',
      encounter: 'Then I encountered God in a powerful way that changed everything. It was a moment of pure grace and revelation.',
      after: 'Now I live with purpose and hope, sharing my story with others.',
    },
    is_public: true,
    share_token: 'test-share-token-bea',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-15'),
  },

  lifeTimeline: {
    id: 'test-lt-123',
    user_id: 'user-123',
    title: 'A Life Transformed',
    framework_type: 'life_timeline' as const,
    content: {
      milestones: [
        {
          age: '15',
          event: 'First encountered faith at a youth camp',
          impact: 'Started questioning my beliefs and searching for truth',
        },
        {
          age: '22',
          event: 'Graduated college and faced major life decisions',
          impact: 'Learned to trust God with my future',
        },
      ],
    },
    is_public: true,
    share_token: 'test-share-token-lt',
    created_at: new Date('2024-02-01'),
    updated_at: new Date('2024-02-15'),
  },

  seasonsOfGrowth: {
    id: 'test-sog-123',
    user_id: 'user-123',
    title: 'Seasons of My Faith',
    framework_type: 'seasons_of_growth' as const,
    content: {
      seasons: [
        {
          season: 'The Winter of Doubt',
          challenges: 'Questioning everything I believed',
          growth: 'Learned that doubt can lead to deeper faith',
          lessons: 'Faith is not the absence of questions',
        },
      ],
    },
    is_public: true,
    share_token: 'test-share-token-sog',
    created_at: new Date('2024-03-01'),
    updated_at: new Date('2024-03-15'),
  },

  freeForm: {
    id: 'test-ff-123',
    user_id: 'user-123',
    title: 'In My Own Words',
    framework_type: 'free_form' as const,
    content: {
      narrative: 'This is my story, told in my own way. It begins with a simple truth: we are all on a journey. My journey has taken me through valleys and over mountains, through darkness and into light.',
    },
    is_public: true,
    share_token: 'test-share-token-ff',
    created_at: new Date('2024-04-01'),
    updated_at: new Date('2024-04-15'),
  },

  noShareToken: {
    id: 'test-no-share-123',
    user_id: 'user-123',
    title: 'Private Testimony',
    framework_type: 'free_form' as const,
    content: {
      narrative: 'This testimony has no share token.',
    },
    is_public: false,
    created_at: new Date('2024-05-01'),
    updated_at: new Date('2024-05-15'),
  },
}

export type MockTestimony = typeof mockTestimonies.beforeEncounterAfter
