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
  isAnonymous?: boolean
}

export function TestimonyEditor({
  initialTitle = '',
  initialFramework,
  initialContent,
  onSave,
  isLoading = false,
  isAnonymous = false,
}: TestimonyEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [framework, setFramework] = useState<FrameworkType | ''>(initialFramework || '')
  const [content, setContent] = useState<Partial<TestimonyContent>>(initialContent || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showAiTeaser, setShowAiTeaser] = useState(false)

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

      <div className="flex justify-end gap-3">
        {/* AI Enhancement Button (Teaser for Anonymous) */}
        {isAnonymous && (
          <button
            type="button"
            onClick={() => setShowAiTeaser(true)}
            className="relative rounded-md bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm hover:from-purple-200 hover:to-indigo-200 transition-all"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Enhance
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-purple-500 text-white text-xs items-center justify-center font-bold">
                ✨
              </span>
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Testimony'}
        </button>
      </div>

      {/* AI Teaser Modal */}
      {showAiTeaser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 mb-4">
                <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Unlock AI-Powered Editing
              </h3>

              <p className="text-gray-600 mb-6">
                Sign up to access AI suggestions that improve clarity, enhance impact, and refine the flow of your testimony.
              </p>

              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Get intelligent writing suggestions</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Improve clarity and readability</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Enhance emotional impact</span>
                </li>
              </ul>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAiTeaser(false)}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    // Save current progress to localStorage as backup
                    localStorage.setItem('testimony_draft', JSON.stringify({
                      title,
                      framework,
                      content
                    }))
                    // Redirect to login
                    window.location.href = '/login?intent=ai_editing'
                  }}
                  className="flex-1 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:from-indigo-500 hover:to-purple-500"
                >
                  Sign Up Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

