'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TestimonyEditor } from '@/components/TestimonyEditor'
import { CreateTestimonyDto, FrameworkType } from '@/domain/testimony/types'
import { createClient } from '@/lib/supabase/client'
import { AnonymousUserClientService } from '@/domain/user/services/AnonymousUserClientService'
import { useExitIntent } from '@/lib/hooks/useExitIntent'
import { ExitIntentModal } from '@/components/ExitIntentModal'

function CreateTestimonyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showExitModal, setShowExitModal] = useState(false)

  // Get framework from query params
  const frameworkParam = searchParams.get('framework') as FrameworkType | null

  // Exit intent detection (only for anonymous users)
  useExitIntent(() => {
    setShowExitModal(true)
  }, isAnonymous && !isInitializing)

  useEffect(() => {
    // If no framework is provided, redirect to framework selection
    if (!frameworkParam) {
      router.push('/create/choose-framework')
      return
    }

    // Validate framework type
    const validFrameworks: FrameworkType[] = ['before_encounter_after', 'life_timeline', 'seasons_of_growth', 'free_form']
    if (!validFrameworks.includes(frameworkParam)) {
      router.push('/create/choose-framework')
      return
    }

    initializeUser()
  }, [frameworkParam, router])

  const initializeUser = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        console.log('[Create] No session found, creating anonymous user...')
        const anonymousService = new AnonymousUserClientService()
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

      // Provide more specific error messages
      let errorMessage = 'Failed to initialize session. Please refresh the page.'
      
      if (error instanceof Error) {
        if (error.message.includes('Unable to connect')) {
          errorMessage = error.message
        } else if (error.message.includes('configuration')) {
          errorMessage = 'Application configuration error. Please contact support.'
        } else if (error.message.includes('Failed to fetch') || error.message.includes('ERR_NAME_NOT_RESOLVED')) {
          errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection and try again.'
        }
      }

      setError(errorMessage)
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
                  You&apos;re creating anonymously
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
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                  <button
                    onClick={() => {
                      setError(null)
                      setIsInitializing(true)
                      initializeUser()
                    }}
                    className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          <TestimonyEditor
            onSave={handleSave}
            isLoading={isLoading}
            isAnonymous={isAnonymous}
            initialFramework={frameworkParam || undefined}
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

export default function CreateTestimonyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CreateTestimonyContent />
    </Suspense>
  )
}
