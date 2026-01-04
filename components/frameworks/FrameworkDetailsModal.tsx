'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FrameworkType } from '@/domain/testimony/types'
import { FrameworkConfig } from '@/lib/frameworks'
import { BeforeEncounterAfter } from './BeforeEncounterAfter'
import { LifeTimeline } from './LifeTimeline'
import { SeasonsOfGrowth } from './SeasonsOfGrowth'
import { FreeFormNarrative } from './FreeFormNarrative'

interface FrameworkDetailsModalProps {
  isOpen: boolean
  framework: FrameworkConfig | null
  onClose: () => void
}

export function FrameworkDetailsModal({ isOpen, framework, onClose }: FrameworkDetailsModalProps) {
  const router = useRouter()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !framework) return null

  const handleUseFramework = () => {
    router.push(`/create?framework=${framework.id}`)
  }

  const renderPreview = () => {
    // Render a read-only preview of the framework form
    const emptyContent = {}
    
    switch (framework.id) {
      case 'before_encounter_after':
        return (
          <div className="space-y-4 opacity-60 pointer-events-none">
            <BeforeEncounterAfter
              value={emptyContent}
              onChange={() => {}}
            />
          </div>
        )
      case 'life_timeline':
        return (
          <div className="space-y-4 opacity-60 pointer-events-none">
            <LifeTimeline
              value={emptyContent}
              onChange={() => {}}
            />
          </div>
        )
      case 'seasons_of_growth':
        return (
          <div className="space-y-4 opacity-60 pointer-events-none">
            <SeasonsOfGrowth
              value={emptyContent}
              onChange={() => {}}
            />
          </div>
        )
      case 'free_form':
        return (
          <div className="opacity-60 pointer-events-none">
            <FreeFormNarrative
              value={emptyContent}
              onChange={() => {}}
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">{framework.icon}</span>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {framework.name}
                </h2>
                <p className="text-lg text-gray-600">
                  {framework.fullDescription}
                </p>
              </div>
            </div>

            {/* Use Cases */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                When to use this framework
              </h3>
              <ul className="space-y-2">
                {framework.useCases.map((useCase, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-indigo-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sample Questions */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Questions to guide your writing
              </h3>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {framework.sampleQuestions.map((question, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <span className="text-indigo-600 mr-2 font-semibold">{index + 1}.</span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Form Preview */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Form Preview
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                {renderPreview()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Selection
              </button>
              <button
                onClick={handleUseFramework}
                className="flex-1 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Use This Framework
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

