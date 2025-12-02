import { Testimony } from '@/domain/testimony/types'

export interface AiSuggestion {
  text: string
  explanation?: string
}

export interface IAiProvider {
  generateSuggestions(testimony: Testimony, prompt: string): Promise<AiSuggestion[]>
}

