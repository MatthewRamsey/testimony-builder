'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FrameworkType, TestimonyContent, CreateTestimonyDto, Testimony } from '@/domain/testimony/types'
import { BeforeEncounterAfter } from './frameworks/BeforeEncounterAfter'
import { LifeTimeline } from './frameworks/LifeTimeline'
import { SeasonsOfGrowth } from './frameworks/SeasonsOfGrowth'
import { FreeFormNarrative } from './frameworks/FreeFormNarrative'
import { getFrameworkName } from '@/lib/frameworks'
import { ShareButtons } from '@/components/ShareButtons'
import { generateExcerptWithFallback } from '@/lib/excerpt'

interface TestimonyEditorProps {
  initialTitle?: string
  initialFramework?: FrameworkType
  initialContent?: TestimonyContent
  initialIsPublic?: boolean
  shareToken?: string
  onSave: (data: CreateTestimonyDto) => void | Promise<void>
  isLoading?: boolean
}

export function TestimonyEditor({
  initialTitle = '',
  initialFramework,
  initialContent,
  initialIsPublic = false,
  shareToken,
  onSave,
  isLoading = false,
}: TestimonyEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [framework, setFramework] = useState<FrameworkType | ''>(initialFramework || '')
  const [content, setContent] = useState<Partial<TestimonyContent>>(initialContent || {})
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isFrameworkPreSelected = !!initialFramework
  const shareUrl = shareToken && typeof window !== 'undefined'
    ? `${window.location.origin}/share/${shareToken}`
    : ''
  const shareExcerpt = shareToken && framework
    ? generateExcerptWithFallback({
        title: title.trim() || 'Untitled testimony',
        framework_type: framework as FrameworkType,
        content: content as TestimonyContent,
      } as Testimony)
    : ''

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
        is_public: isPublic,
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
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter a title for your testimony"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {!isFrameworkPreSelected ? (
        <div>
          <label htmlFor="framework" className="block text-sm font-medium text-gray-700 mb-2">
            Select Framework
          </label>
          <select
            id="framework"
            value={framework}
            onChange={(e) => handleFrameworkChange(e.target.value as FrameworkType)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Framework
            </label>
            <button
              type="button"
              onClick={() => router.push('/create/choose-framework')}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Change Framework
            </button>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-md px-3 py-2 text-gray-900 sm:text-sm">
            {getFrameworkName(framework as FrameworkType)}
          </div>
        </div>
      )}

      {framework && (
        <div className="border-t border-gray-200 pt-6">
          {renderFrameworkComponent()}
        </div>
      )}

      {/* Public/Private Toggle */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <label htmlFor="isPublic" className="block text-sm font-medium text-gray-700 mb-1">
              Gallery Visibility
            </label>
            <p className="text-xs text-gray-500">
              {isPublic
                ? 'This testimony will be visible in the public gallery'
                : 'This testimony will only be visible to you in your dashboard'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Gallery visibility is separate from sharing. Shared links are read-only.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${isPublic ? 'text-gray-600' : 'text-indigo-600'}`}>
              Private
            </span>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isPublic ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={isPublic}
              aria-label="Toggle gallery visibility"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isPublic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isPublic ? 'text-indigo-600' : 'text-gray-600'}`}>
              Public
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {isPublic && (
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Visible in Gallery
            </span>
          )}
        </div>
        <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Share read-only link</p>
              <p className="text-xs text-gray-500">
                Readers can view your testimony, but they won&apos;t be able to edit it.
              </p>
            </div>
          </div>
          {shareToken ? (
            <ShareButtons
              shareUrl={shareUrl}
              title={title.trim() || 'Untitled testimony'}
              excerpt={shareExcerpt}
              showLabels={false}
              size="sm"
            />
          ) : (
            <p className="text-xs text-gray-500">
              Save your testimony first to generate a shareable link.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Testimony'}
        </button>
      </div>
    </div>
  )
}
