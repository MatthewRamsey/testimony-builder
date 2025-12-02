'use client'

import { useState } from 'react'
import { FrameworkType, TestimonyContent, CreateTestimonyDto } from '@/domain/testimony/types'
import { BeforeEncounterAfter } from './frameworks/BeforeEncounterAfter'
import { LifeTimeline } from './frameworks/LifeTimeline'
import { SeasonsOfGrowth } from './frameworks/SeasonsOfGrowth'
import { FreeFormNarrative } from './frameworks/FreeFormNarrative'

interface TestimonyEditorProps {
  initialTitle?: string
  initialFramework?: FrameworkType
  initialContent?: TestimonyContent
  onSave: (data: CreateTestimonyDto) => void | Promise<void>
  isLoading?: boolean
}

export function TestimonyEditor({
  initialTitle = '',
  initialFramework,
  initialContent,
  onSave,
  isLoading = false,
}: TestimonyEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [framework, setFramework] = useState<FrameworkType | ''>(initialFramework || '')
  const [content, setContent] = useState<Partial<TestimonyContent>>(initialContent || {})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFrameworkChange = (newFramework: FrameworkType) => {
    setFramework(newFramework)
    // Reset content when framework changes
    setContent({})
  }

  const handleSave = async () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!framework) {
      newErrors.framework = 'Please select a framework'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    try {
      await onSave({
        title: title.trim(),
        framework_type: framework as FrameworkType,
        content: content as TestimonyContent,
      })
    } catch (error) {
      console.error('Error saving testimony:', error)
    }
  }

  const renderFrameworkComponent = () => {
    if (!framework) return null

    switch (framework) {
      case 'before_encounter_after':
        return (
          <BeforeEncounterAfter
            value={content as any}
            onChange={(value) => setContent(value)}
          />
        )
      case 'life_timeline':
        return (
          <LifeTimeline
            value={content as any}
            onChange={(value) => setContent(value)}
          />
        )
      case 'seasons_of_growth':
        return (
          <SeasonsOfGrowth
            value={content as any}
            onChange={(value) => setContent(value)}
          />
        )
      case 'free_form':
        return (
          <FreeFormNarrative
            value={content as any}
            onChange={(value) => setContent(value)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter a title for your testimony"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="framework" className="block text-sm font-medium text-gray-700 mb-2">
          Select Framework
        </label>
        <select
          id="framework"
          value={framework}
          onChange={(e) => handleFrameworkChange(e.target.value as FrameworkType)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Choose a framework...</option>
          <option value="before_encounter_after">Before → Encounter → After</option>
          <option value="life_timeline">Life Timeline</option>
          <option value="seasons_of_growth">Seasons of Growth</option>
          <option value="free_form">Free-Form Narrative</option>
        </select>
        {errors.framework && (
          <p className="mt-1 text-sm text-red-600">{errors.framework}</p>
        )}
      </div>

      {framework && (
        <div className="border-t border-gray-200 pt-6">
          {renderFrameworkComponent()}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Testimony'}
        </button>
      </div>
    </div>
  )
}

