'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Testimony } from '@/domain/testimony/types'
import { TestimonyPreview } from '@/components/TestimonyPreview'
import { ShareButtons } from '@/components/ShareButtons'
import { generateExcerptWithFallback } from '@/lib/excerpt'

interface SharePageData {
  testimony: Testimony
  isOwner: boolean
  isAnonymous: boolean
}

interface ShareContentProps {
  token: string
}

export function ShareContent({ token }: ShareContentProps) {
  const [data, setData] = useState<SharePageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [claimEmail, setClaimEmail] = useState('')
  const [claimSending, setClaimSending] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [claimSent, setClaimSent] = useState(false)

  useEffect(() => {
    fetchTestimony()
  }, [token])

  const fetchTestimony = async () => {
    try {
      const response = await fetch(`/api/testimonies/share/${token}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('Testimony not found')
        } else {
          setError('Failed to load testimony')
        }
        return
      }

      const fetchedData = await response.json()
      setData(fetchedData)
    } catch (err) {
      console.error('Error fetching testimony:', err)
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 3000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleExportPDF = async () => {
    if (!data?.testimony) return

    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testimonyId: data.testimony.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to export PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${data.testimony.title || 'testimony'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert('Failed to export PDF. Please try again.')
    }
  }

  const handleClaimSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setClaimSending(true)
    setClaimError(null)
    setClaimSent(false)

    try {
      const response = await fetch('/api/users/anonymous/claim-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareToken: token,
          email: claimEmail,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Unable to save email')
      }

      setClaimSent(true)
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : 'Unable to save email')
    } finally {
      setClaimSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading testimony...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Testimony not found'}
          </h2>
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const excerpt = generateExcerptWithFallback(data.testimony)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Section with Claim CTA (Anonymous Users Only) */}
        {data.isAnonymous && (
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl shadow-2xl p-8 mb-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"60\\" height=\\"60\\" viewBox=\\"0 0 60 60\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cg fill=\\"none\\" fill-rule=\\"evenodd\\"%3E%3Cg fill=\\"%23ffffff\\" fill-opacity=\\"1\\"%3E%3Cpath d=\\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
              }}></div>
            </div>

            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-extrabold mb-4">
                Claim Your Testimony
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                You created this testimony anonymously. Add your email so we can connect it to your
                account when you sign in later.
              </p>

              <form
                onSubmit={handleClaimSubmit}
                className="mx-auto mb-6 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  value={claimEmail}
                  onChange={(event) => setClaimEmail(event.target.value)}
                  className="w-full rounded-lg border border-white/40 bg-white/90 px-4 py-3 text-sm text-indigo-900 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="Enter your email to claim this testimony"
                />
                <button
                  type="submit"
                  disabled={claimSending}
                  className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-indigo-600 shadow-lg transition-all hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {claimSending ? 'Saving...' : 'Save Testimony'}
                </button>
              </form>

              {claimError && (
                <div className="mx-auto mb-4 max-w-xl rounded-lg bg-white/90 px-4 py-3 text-sm text-red-700">
                  {claimError}
                </div>
              )}
              {claimSent && (
                <div className="mx-auto mb-4 max-w-xl rounded-lg bg-white/90 px-4 py-3 text-sm text-indigo-700">
                  Email saved. When you sign in later, we will link this testimony to your account.
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <button
                  onClick={handleCopyLink}
                  className="bg-indigo-500 bg-opacity-30 backdrop-blur text-white px-8 py-4 rounded-lg font-semibold hover:bg-opacity-40 transition-all border border-white border-opacity-30"
                >
                  {linkCopied ? (
                    <>
                      <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Copy Link to Share
                    </>
                  )}
                </button>
              </div>

              <p className="text-sm text-indigo-100">
                Free account. Takes 30 seconds. No credit card required.
              </p>
            </div>
          </div>
        )}

        {/* Claimed/Authenticated User Info */}
        {!data.isAnonymous && data.isOwner && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-green-800 text-center">
              This is your testimony.
              <Link href="/dashboard" className="ml-2 font-semibold underline">
                View in Dashboard
              </Link>
            </p>
          </div>
        )}

        {/* Testimony Preview Card */}
        <div className="bg-white shadow-xl rounded-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {data.testimony.title}
            </h1>
            {data.isOwner && (
              <button
                onClick={handleExportPDF}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 flex items-center gap-2 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </button>
            )}
          </div>

          <TestimonyPreview testimony={data.testimony} />

          {/* Share Buttons Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Share this testimony</h3>
            <ShareButtons
              shareUrl={shareUrl}
              title={data.testimony.title}
              excerpt={excerpt}
              showLabels={true}
              size="md"
            />
          </div>
        </div>

        {/* Feature Cards (Anonymous Users Only) */}
        {data.isAnonymous && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Save Forever</h3>
              <p className="text-sm text-gray-600">
                Create an account to permanently save this testimony and never lose it
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276a1 1 0 010 4.552L15 10zM4 6h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Read-Only Sharing</h3>
              <p className="text-sm text-gray-600">
                Share a clean, read-only link so others can read without making changes
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Edit Anytime</h3>
              <p className="text-sm text-gray-600">
                Come back and update your testimony whenever inspiration strikes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
