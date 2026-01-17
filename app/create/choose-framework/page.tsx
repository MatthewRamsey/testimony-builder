'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FrameworkCard } from '@/components/frameworks/FrameworkCard'
import { FrameworkDetailsModal } from '@/components/frameworks/FrameworkDetailsModal'
import { frameworks, FrameworkConfig } from '@/lib/frameworks'
import { FrameworkType } from '@/domain/testimony/types'
import { createClient } from '@/lib/supabase/client'
import { AnonymousUserClientService } from '@/domain/user/services/AnonymousUserClientService'

export default function ChooseFrameworkPage() {
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(true)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFramework, setSelectedFramework] = useState<FrameworkConfig | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    initializeUser()
  }, [])

  const initializeUser = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        console.log('[ChooseFramework] No session found, creating anonymous user...')
        const anonymousService = new AnonymousUserClientService()
        await anonymousService.createAnonymousUser()
        setIsAnonymous(true)
      } else {
        // Check if existing user is anonymous
        const response = await fetch('/api/users/anonymous/check')
        const { isAnonymous } = await response.json()
        setIsAnonymous(isAnonymous)
        console.log('[ChooseFramework] User session exists, isAnonymous:', isAnonymous)
      }
    } catch (error) {
      console.error('[ChooseFramework] Error initializing user:', error)
      setError('Failed to initialize session. Please refresh the page.')
    } finally {
      setIsInitializing(false)
    }
  }

  const handleFrameworkClick = (frameworkType: FrameworkType) => {
    const framework = frameworks.find(f => f.id === frameworkType)
    if (framework) {
      setSelectedFramework(framework)
      setShowModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedFramework(null)
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Anonymous User Notice */}
        {isAnonymous && (
          <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-indigo-900">
                  You&apos;re creating anonymously
                </h3>
                <p className="mt-1 text-sm text-indigo-700">
                  Your testimony will be saved temporarily. Sign up after completion to claim it permanently and access it from any device.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Framework
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select a storytelling framework that best fits your testimony. Each framework offers a different structure to help you share your faith journey.
          </p>
        </div>

        {/* Framework Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {frameworks.map((framework) => (
            <FrameworkCard
              key={framework.id}
              framework={framework}
              onClick={handleFrameworkClick}
            />
          ))}
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Not sure which framework to choose? Click on any card to learn more about it.
          </p>
        </div>
      </div>

      {/* Framework Details Modal */}
      <FrameworkDetailsModal
        isOpen={showModal}
        framework={selectedFramework}
        onClose={handleCloseModal}
      />
    </div>
  )
}
