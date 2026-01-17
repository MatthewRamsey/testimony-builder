import {
  Testimony,
  FrameworkType,
  BeforeEncounterAfterContent,
  LifeTimelineContent,
  SeasonsOfGrowthContent,
  FreeFormContent,
} from '@/domain/testimony/types'

const MAX_EXCERPT_LENGTH = 160

/**
 * Truncates text at a word boundary to fit within the max length.
 * Adds ellipsis if truncated.
 */
function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (!text) return ''

  const trimmed = text.trim()
  if (trimmed.length <= maxLength) return trimmed

  // Find the last space within the limit
  const truncated = trimmed.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace).trim() + '...'
  }

  // No space found, hard truncate
  return truncated.trim() + '...'
}

/**
 * Extracts excerpt from Before/Encounter/After framework.
 * Uses the 'encounter' field as it represents the transformative moment.
 */
function extractBeforeEncounterAfterExcerpt(content: BeforeEncounterAfterContent): string {
  return content.encounter || content.before || content.after || ''
}

/**
 * Extracts excerpt from Life Timeline framework.
 * Uses the first milestone's event and impact.
 */
function extractLifeTimelineExcerpt(content: LifeTimelineContent): string {
  if (!content.milestones || content.milestones.length === 0) return ''

  const firstMilestone = content.milestones[0]
  const combined = [firstMilestone.event, firstMilestone.impact]
    .filter(Boolean)
    .join(' - ')

  return combined
}

/**
 * Extracts excerpt from Seasons of Growth framework.
 * Uses the first season's growth or lessons.
 */
function extractSeasonsOfGrowthExcerpt(content: SeasonsOfGrowthContent): string {
  if (!content.seasons || content.seasons.length === 0) return ''

  const firstSeason = content.seasons[0]
  return firstSeason.growth || firstSeason.lessons || firstSeason.challenges || ''
}

/**
 * Extracts excerpt from Free Form framework.
 * Uses the beginning of the narrative.
 */
function extractFreeFormExcerpt(content: FreeFormContent): string {
  return content.narrative || ''
}

/**
 * Generates an excerpt from testimony content based on framework type.
 * Returns a truncated excerpt suitable for social sharing (~160 chars for Twitter).
 */
export function generateExcerpt(testimony: Testimony, maxLength: number = MAX_EXCERPT_LENGTH): string {
  let rawExcerpt = ''

  switch (testimony.framework_type) {
    case 'before_encounter_after':
      rawExcerpt = extractBeforeEncounterAfterExcerpt(testimony.content as BeforeEncounterAfterContent)
      break
    case 'life_timeline':
      rawExcerpt = extractLifeTimelineExcerpt(testimony.content as LifeTimelineContent)
      break
    case 'seasons_of_growth':
      rawExcerpt = extractSeasonsOfGrowthExcerpt(testimony.content as SeasonsOfGrowthContent)
      break
    case 'free_form':
      rawExcerpt = extractFreeFormExcerpt(testimony.content as FreeFormContent)
      break
    default:
      rawExcerpt = ''
  }

  return truncateAtWordBoundary(rawExcerpt, maxLength)
}

/**
 * Generates a default excerpt if content-based excerpt is empty.
 */
export function generateExcerptWithFallback(testimony: Testimony, maxLength: number = MAX_EXCERPT_LENGTH): string {
  const excerpt = generateExcerpt(testimony, maxLength)

  if (excerpt) return excerpt

  // Fallback to title-based description
  return `Read "${testimony.title}" - a personal testimony of faith and transformation.`
}
