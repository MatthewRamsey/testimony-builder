'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ClaimProcessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    processClaim()
  }, [])

  const processClaim = async () => {
    try {
      // Get claim token from URL parameter or localStorage
      let claimToken = searchParams.get('token')

      if (!claimToken) {
        claimToken = localStorage.getItem('pending_claim_token')
      }

      if (!claimToken) {
        console.error('[Claim Process] No claim token found')
        // No claim token, just redirect to dashboard
        router.push('/dashboard')
        return
      }

      console.log('[Claim Process] Processing claim for token:', claimToken)

      // Call claim API
      const response = await fetch('/api/users/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shareToken: claimToken }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to claim testimony')
      }

      const data = await response.json()
      console.log('[Claim Process] Claim successful:', data)

      // Clean up localStorage
      localStorage.removeItem('pending_claim_token')

      // Show success briefly then redirect
      setStatus('success')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      console.error('[Claim Process] Error:', err)
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred')

      // Redirect to dashboard after showing error
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-md space-y-8 text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <h2 className="text-2xl font-bold text-gray-900 mt-6">
              Claiming Your Testimony...
            </h2>
            <p className="text-gray-600">
              Please wait while we transfer ownership to your account
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-900 mt-6">
              Success! Testimony Claimed
            </h2>
            <p className="text-gray-600">
              Your testimony has been saved to your account. Redirecting to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-900 mt-6">
              Claim Failed
            </h2>
            <p className="text-gray-600">
              {errorMessage || 'Unable to claim testimony. You can still access it from the share link.'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Redirecting to dashboard...
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function ClaimProcessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
      </div>
    }>
      <ClaimProcessContent />
    </Suspense>
  )
}
