'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Testimony } from '@/domain/testimony/types'
import { TestimonyPreview } from '@/components/TestimonyPreview'

interface SharePageData {
  testimony: Testimony
  isOwner: boolean
  isAnonymous: boolean
}

export default function ShareTestimonyPage() {
  const params = useParams()
  const token = params.token as string

  const [data, setData] = useState<SharePageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

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
                You created this testimony anonymously. Sign up now to save it permanently,
                edit it anytime, and unlock AI-powered enhancements.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Link
                  href={`/login?claim=${token}`}
                  className="bg-white text-indigo-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Sign Up & Claim This Testimony
                </Link>
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
                ✓ Free account  ✓ Takes 30 seconds  ✓ No credit card required
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
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {data.testimony.title}
            </h1>
            <button
              onClick={handleExportPDF}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
          </div>

          <TestimonyPreview testimony={data.testimony} />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">AI Enhancements</h3>
              <p className="text-sm text-gray-600">
                Get AI-powered suggestions to improve clarity, impact, and flow
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
