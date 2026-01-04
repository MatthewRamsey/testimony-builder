import { FrameworkType } from '@/domain/testimony/types'

export interface FrameworkConfig {
  id: FrameworkType
  name: string
  briefDescription: string
  fullDescription: string
  useCases: string[]
  sampleQuestions: string[]
  visualStructure: {
    type: 'progression' | 'timeline' | 'seasons' | 'narrative'
    elements: string[]
  }
  icon: string
}

export const frameworks: FrameworkConfig[] = [
  {
    id: 'before_encounter_after',
    name: 'Before → Encounter → After',
    briefDescription: 'Tell your story through three transformative phases: life before, the moment of encounter, and life after.',
    fullDescription: 'This framework helps you structure your testimony around three key phases of your faith journey. It\'s perfect for stories with a clear turning point or moment of transformation. You\'ll describe your life before your encounter with faith, the moment or period of encounter itself, and how your life has changed since.',
    useCases: [
      'You have a clear moment of conversion or spiritual awakening',
      'You want to highlight the contrast between your old and new life',
      'Your story has a distinct "before and after" transformation',
      'You\'re sharing a testimony for the first time'
    ],
    sampleQuestions: [
      'What was your life like before your encounter with faith?',
      'What were your beliefs, values, and priorities?',
      'What led to your encounter or moment of change?',
      'How did you experience God or faith in that moment?',
      'What has changed in your life since that encounter?',
      'How has your perspective, relationships, or purpose shifted?'
    ],
    visualStructure: {
      type: 'progression',
      elements: ['Before', 'Encounter', 'After']
    },
    icon: '🔄'
  },
  {
    id: 'life_timeline',
    name: 'Life Timeline',
    briefDescription: 'Document key milestones and events throughout your faith journey in chronological order.',
    fullDescription: 'The Life Timeline framework allows you to tell your story through significant moments and milestones. This approach is ideal if your faith journey has developed over time through multiple experiences, events, or seasons. You can add as many milestones as needed, each capturing a specific age, event, and its impact on your journey.',
    useCases: [
      'Your faith journey spans many years or decades',
      'You have multiple significant moments to share',
      'You want to show how your faith has evolved over time',
      'You prefer a chronological storytelling approach'
    ],
    sampleQuestions: [
      'What age or time period was this milestone?',
      'What specific event or experience happened?',
      'How did this moment impact your faith journey?',
      'What did you learn or how did you grow?',
      'How did this shape who you are today?'
    ],
    visualStructure: {
      type: 'timeline',
      elements: ['Milestone 1', 'Milestone 2', 'Milestone 3', '...']
    },
    icon: '📅'
  },
  {
    id: 'seasons_of_growth',
    name: 'Seasons of Growth',
    briefDescription: 'Explore different seasons or periods of your life, each with its own challenges, growth, and lessons.',
    fullDescription: 'The Seasons of Growth framework helps you reflect on distinct periods of your life, each with unique challenges and opportunities for spiritual growth. This approach is perfect if your journey has had multiple phases or if you want to explore how different life circumstances shaped your faith. Each season captures the challenges you faced, how you grew, and the lessons you learned.',
    useCases: [
      'Your faith journey has distinct phases or seasons',
      'You want to explore how different life circumstances shaped your faith',
      'You\'ve experienced growth through various challenges',
      'You prefer thematic organization over chronological'
    ],
    sampleQuestions: [
      'What season or period of life was this?',
      'What challenges did you face during this season?',
      'How did you grow spiritually during this time?',
      'What lessons did you learn?',
      'How did this season prepare you for what came next?'
    ],
    visualStructure: {
      type: 'seasons',
      elements: ['Season 1', 'Season 2', 'Season 3', '...']
    },
    icon: '🌱'
  },
  {
    id: 'free_form',
    name: 'Free-Form Narrative',
    briefDescription: 'Write your testimony in your own words, without a structured framework.',
    fullDescription: 'The Free-Form Narrative gives you complete freedom to tell your story however feels most natural to you. This framework is perfect if you prefer to write organically, if your story doesn\'t fit neatly into other structures, or if you want maximum flexibility in how you express your journey. Simply write your testimony as it flows from your heart.',
    useCases: [
      'You prefer to write organically without structure',
      'Your story doesn\'t fit neatly into other frameworks',
      'You want maximum flexibility in expression',
      'You\'re comfortable with unstructured storytelling'
    ],
    sampleQuestions: [
      'What is your faith story?',
      'How has your relationship with God developed?',
      'What experiences have shaped your faith?',
      'What would you want others to know about your journey?'
    ],
    visualStructure: {
      type: 'narrative',
      elements: ['Your Story']
    },
    icon: '✍️'
  }
]

export function getFrameworkConfig(frameworkType: FrameworkType): FrameworkConfig | undefined {
  return frameworks.find(f => f.id === frameworkType)
}

export function getFrameworkName(frameworkType: FrameworkType): string {
  return getFrameworkConfig(frameworkType)?.name || frameworkType
}

