export type FrameworkType = 
  | 'before_encounter_after'
  | 'life_timeline'
  | 'seasons_of_growth'
  | 'free_form'

export interface BeforeEncounterAfterContent {
  before: string
  encounter: string
  after: string
}

export interface LifeTimelineMilestone {
  age: string
  event: string
  impact: string
}

export interface LifeTimelineContent {
  milestones: LifeTimelineMilestone[]
}

export interface Season {
  season: string
  challenges: string
  growth: string
  lessons: string
}

export interface SeasonsOfGrowthContent {
  seasons: Season[]
}

export interface FreeFormContent {
  narrative: string
}

export type TestimonyContent = 
  | BeforeEncounterAfterContent
  | LifeTimelineContent
  | SeasonsOfGrowthContent
  | FreeFormContent

export interface Testimony {
  id: string
  user_id: string
  title: string
  framework_type: FrameworkType
  content: TestimonyContent
  is_public: boolean
  share_token?: string
  created_at: Date
  updated_at: Date
}

export type PublicTestimony = Omit<Testimony, 'user_id' | 'share_token'>

export interface CreateTestimonyDto {
  title: string
  framework_type: FrameworkType
  content: TestimonyContent
  is_public?: boolean
}

export interface UpdateTestimonyDto {
  title?: string
  content?: TestimonyContent
  is_public?: boolean
}

