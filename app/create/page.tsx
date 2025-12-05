'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TestimonyEditor } from '@/components/TestimonyEditor'
import { CreateTestimonyDto } from '@/domain/testimony/types'
import { createClient } from '@/lib/supabase/client'
import { AnonymousUserService } from '@/domain/user/services/AnonymousUserService'
import { useExitIntent } from '@/lib/hooks/useExitIntent'
import { ExitIntentModal } from '@/components/ExitIntentModal'

export default function CreateTestimonyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showExitModal, setShowExitModal] = useState(false)

  // Exit intent detection (only for anonymous users)
  useExitIntent(() => {
    setShowExitModal(true)
  }, isAnonymous && !isInitializing)

  useEffect(() => {
    initializeUser()
  }, [])

  const initializeUser = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        console.log('[Create] No session found, creating anonymous user...')
        const anonymousService = new AnonymousUserService()
        await anonymousService.createAnonymousUser()
        setIsAnonymous(true)
      } else {
        // Check if existing user is anonymous
        const response = await fetch('/api/users/anonymous/check')
        const { isAnonymous } = await response.json()
        setIsAnonymous(isAnonymous)
        console.log('[Create] User session exists, isAnonymous:', isAnonymous)
      }
    } catch (error) {
      console.error('[Create] Error initializing user:', error)
      setError('Failed to initialize session. Please refresh the page.')
    } finally {
      setIsInitializing(false)
    }
  }

  const handleSave = async (data: CreateTestimonyDto) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/testimonies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create testimony')
      }

      const testimony = await response.json()

      // Redirect based on user type
      if (isAnonymous && testimony.share_token) {
        // Anonymous users go to share page with claim CTA
        router.push(`/share/${testimony.share_token}`)
      } else {
        // Authenticated users go to dashboard
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExitModalSignUp = () => {
    // Save draft to localStorage before redirecting
    // Note: The testimony editor component will handle saving drafts internally
    router.push('/login?intent=save_testimony')
  }

  const handleExitModalClose = () => {
    setShowExitModal(false)
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  You're creating anonymously
                </h3>
                <p className="mt-1 text-sm text-indigo-700">
                  Your testimony will be saved temporarily. Sign up after completion to claim it permanently and unlock AI editing features.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Create New Testimony
          </h1>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <TestimonyEditor
            onSave={handleSave}
            isLoading={isLoading}
            isAnonymous={isAnonymous}
          />
        </div>
      </div>

      {/* Exit Intent Modal */}
      <ExitIntentModal
        isOpen={showExitModal}
        onClose={handleExitModalClose}
        onSignUp={handleExitModalSignUp}
      />
    </div>
  )
}
