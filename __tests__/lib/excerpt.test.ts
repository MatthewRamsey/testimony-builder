import { generateExcerpt, generateExcerptWithFallback } from '@/lib/excerpt'
import { Testimony } from '@/domain/testimony/types'

describe('generateExcerpt', () => {
  const baseTestimony: Omit<Testimony, 'framework_type' | 'content'> = {
    id: 'test-id',
    user_id: 'user-id',
    title: 'Test Testimony',
    is_public: true,
    share_token: 'test-token',
    created_at: new Date(),
    updated_at: new Date(),
  }

  describe('before_encounter_after framework', () => {
    it('should extract excerpt from encounter field', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'before_encounter_after',
        content: {
          before: 'Life before was hard.',
          encounter: 'Then I met God and everything changed in that powerful moment.',
          after: 'Now life is transformed.',
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt).toContain('met God')
      expect(excerpt).toContain('everything changed')
    })

    it('should fall back to before field if encounter is empty', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'before_encounter_after',
        content: {
          before: 'Life before was difficult and challenging.',
          encounter: '',
          after: 'Now life is better.',
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt).toContain('Life before')
    })

    it('should fall back to after field if both before and encounter are empty', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'before_encounter_after',
        content: {
          before: '',
          encounter: '',
          after: 'Now I live with purpose and joy.',
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt).toContain('purpose and joy')
    })
  })

  describe('life_timeline framework', () => {
    it('should extract excerpt from first milestone', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'life_timeline',
        content: {
          milestones: [
            {
              age: '15',
              event: 'First encountered faith at summer camp',
              impact: 'Began questioning my beliefs and searching',
            },
            {
              age: '20',
              event: 'College graduation',
              impact: 'Started new chapter',
            },
          ],
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt).toContain('First encountered faith')
      expect(excerpt).toContain('summer camp')
    })

    it('should handle empty milestones array', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'life_timeline',
        content: {
          milestones: [],
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt).toBe('')
    })

    it('should combine event and impact with separator', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'life_timeline',
        content: {
          milestones: [
            {
              age: '18',
              event: 'Graduation day',
              impact: 'Started new journey',
            },
          ],
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt).toContain('Graduation day')
      expect(excerpt).toContain(' - ')
      expect(excerpt).toContain('Started new journey')
    })
  })

  describe('seasons_of_growth framework', () => {
    it('should extract excerpt from first season growth field', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'seasons_of_growth',
        content: {
          seasons: [
            {
              season: 'Winter of Doubt',
              challenges: 'Questioned everything',
              growth: 'Learned that doubt can strengthen faith in unexpected ways.',
              lessons: 'Embrace uncertainty',
            },
          ],
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt).toContain('doubt can strengthen faith')
    })

    it('should fall back to lessons if growth is empty', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'seasons_of_growth',
        content: {
          seasons: [
            {
              season: 'Summer',
              challenges: 'Busy times',
              growth: '',
              lessons: 'Patience is a virtue worth cultivating.',
            },
          ],
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt).toContain('Patience is a virtue')
    })

    it('should fall back to challenges if both growth and lessons are empty', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'seasons_of_growth',
        content: {
          seasons: [
            {
              season: 'Fall',
              challenges: 'Facing difficult transitions and changes.',
              growth: '',
              lessons: '',
            },
          ],
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt).toContain('difficult transitions')
    })

    it('should handle empty seasons array', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'seasons_of_growth',
        content: {
          seasons: [],
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt).toBe('')
    })
  })

  describe('free_form framework', () => {
    it('should extract excerpt from narrative field', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'free_form',
        content: {
          narrative: 'This is my personal journey through faith and transformation. It began in a small town where I grew up learning about community and love.',
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt).toContain('personal journey')
    })

    it('should handle empty narrative', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'free_form',
        content: {
          narrative: '',
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt).toBe('')
    })
  })

  describe('truncation', () => {
    it('should truncate at word boundary when exceeding max length', () => {
      const longText = 'This is a very long testimony that contains many words and will definitely exceed the maximum character limit of 160 characters which is used for Twitter compatibility and social media sharing purposes.'

      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'free_form',
        content: {
          narrative: longText,
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt.length).toBeLessThanOrEqual(163) // 160 + "..."
      expect(excerpt.endsWith('...')).toBe(true)
      // Should end with a complete word before ellipsis (word + space removed, then ...)
      // The last character before ... should be a letter (end of a word)
      const beforeEllipsis = excerpt.slice(0, -3)
      expect(beforeEllipsis).toMatch(/\w$/)
    })

    it('should not truncate short text', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'free_form',
        content: {
          narrative: 'Short text.',
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt).toBe('Short text.')
      expect(excerpt.endsWith('...')).toBe(false)
    })

    it('should respect custom max length parameter', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'free_form',
        content: {
          narrative: 'This is some text that will be truncated at a custom length.',
        },
      }

      const excerpt = generateExcerpt(testimony, 30)
      expect(excerpt.length).toBeLessThanOrEqual(33) // 30 + "..."
    })
  })

  describe('edge cases', () => {
    it('should handle whitespace-only content', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'free_form',
        content: {
          narrative: '   \n\t   ',
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt).toBe('')
    })

    it('should handle special characters', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'free_form',
        content: {
          narrative: 'Special chars: & < > " \' © ® ™',
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt).toContain('&')
      expect(excerpt).toContain('<')
    })

    it('should handle unicode characters', () => {
      const testimony: Testimony = {
        ...baseTestimony,
        framework_type: 'free_form',
        content: {
          narrative: 'Unicode: こんにちは 你好 مرحبا',
        },
      }

      const excerpt = generateExcerpt(testimony)
      expect(excerpt).toContain('こんにちは')
    })
  })
})

describe('generateExcerptWithFallback', () => {
  const baseTestimony: Omit<Testimony, 'framework_type' | 'content'> = {
    id: 'test-id',
    user_id: 'user-id',
    title: 'My Amazing Testimony',
    is_public: true,
    share_token: 'test-token',
    created_at: new Date(),
    updated_at: new Date(),
  }

  it('should return content-based excerpt when available', () => {
    const testimony: Testimony = {
      ...baseTestimony,
      framework_type: 'free_form',
      content: {
        narrative: 'This is my story.',
      },
    }

    const excerpt = generateExcerptWithFallback(testimony)
    expect(excerpt).toBe('This is my story.')
  })

  it('should return title-based fallback when content is empty', () => {
    const testimony: Testimony = {
      ...baseTestimony,
      framework_type: 'free_form',
      content: {
        narrative: '',
      },
    }

    const excerpt = generateExcerptWithFallback(testimony)
    expect(excerpt).toContain('My Amazing Testimony')
    expect(excerpt).toContain('faith and transformation')
  })

  it('should include testimony title in fallback message', () => {
    const testimony: Testimony = {
      ...baseTestimony,
      title: 'Custom Title Here',
      framework_type: 'seasons_of_growth',
      content: {
        seasons: [],
      },
    }

    const excerpt = generateExcerptWithFallback(testimony)
    expect(excerpt).toContain('Custom Title Here')
  })
})
