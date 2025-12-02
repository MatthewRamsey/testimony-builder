import { IAiProvider, AiSuggestion } from '../interfaces/IAiProvider'
import { Testimony } from '@/domain/testimony/types'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

function sanitizeInput(text: string): string {
  if (typeof window === 'undefined') {
    const window = new JSDOM('').window
    const purify = DOMPurify(window as any)
    return purify.sanitize(text, { ALLOWED_TAGS: [] })
  }
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}

function formatTestimonyContent(testimony: Testimony): string {
  let content = `Title: ${testimony.title}\n\n`
  
  switch (testimony.framework_type) {
    case 'before_encounter_after':
      const bea = testimony.content as any
      content += `Before: ${bea.before || ''}\n\n`
      content += `Encounter: ${bea.encounter || ''}\n\n`
      content += `After: ${bea.after || ''}`
      break
    case 'life_timeline':
      const timeline = testimony.content as any
      content += 'Life Timeline:\n'
      timeline.milestones?.forEach((m: any, i: number) => {
        content += `\nMilestone ${i + 1}:\n`
        content += `Age: ${m.age || ''}\n`
        content += `Event: ${m.event || ''}\n`
        content += `Impact: ${m.impact || ''}\n`
      })
      break
    case 'seasons_of_growth':
      const seasons = testimony.content as any
      content += 'Seasons of Growth:\n'
      seasons.seasons?.forEach((s: any, i: number) => {
        content += `\nSeason ${i + 1}: ${s.season || ''}\n`
        content += `Challenges: ${s.challenges || ''}\n`
        content += `Growth: ${s.growth || ''}\n`
        content += `Lessons: ${s.lessons || ''}\n`
      })
      break
    case 'free_form':
      const freeForm = testimony.content as any
      content += freeForm.narrative || ''
      break
  }
  
  return content
}

export class VercelAIProvider implements IAiProvider {
  async generateSuggestions(testimony: Testimony, prompt: string): Promise<AiSuggestion[]> {
    const sanitizedPrompt = sanitizeInput(prompt)
    const testimonyContent = formatTestimonyContent(testimony)
    const sanitizedContent = sanitizeInput(testimonyContent)

    const systemPrompt = `You are a helpful assistant that provides editing suggestions for personal faith testimonies. 
    Provide constructive, encouraging feedback that helps users improve their testimony while maintaining authenticity.
    Return your suggestions as a JSON array of objects with "text" and "explanation" fields.`

    const userPrompt = `Testimony content:\n\n${sanitizedContent}\n\nUser request: ${sanitizedPrompt}\n\nProvide specific, actionable suggestions.`

    try {
      const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        system: systemPrompt,
        prompt: userPrompt,
        maxTokens: 1000,
      })

      // Try to parse as JSON, fallback to simple text suggestions
      try {
        const parsed = JSON.parse(text)
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            text: item.text || item,
            explanation: item.explanation,
          }))
        }
      } catch {
        // If not JSON, split by lines or paragraphs
        const suggestions = text
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => ({ text: line.trim() }))
        return suggestions.slice(0, 5) // Limit to 5 suggestions
      }

      return [{ text }]
    } catch (error) {
      console.error('AI generation error:', error)
      throw new Error('Failed to generate AI suggestions')
    }
  }
}

