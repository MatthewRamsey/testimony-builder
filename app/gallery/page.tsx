'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TestimonyPreview } from '@/components/TestimonyPreview'
import { Testimony } from '@/domain/testimony/types'

interface GalleryEntry {
  id: string
  displayName: string | null
  testimony: Testimony | null
  created_at: string
}

export default function GalleryPage() {
  const [entries, setEntries] = useState<GalleryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGallery()
  }, [])

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/gallery')
      
      if (!response.ok) {
        throw new Error('Failed to fetch gallery')
      }

      const data = await response.json()
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading gallery...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Public Gallery</h1>
          <p className="mt-2 text-gray-600">
            Browse testimonies shared by the community
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-600">No testimonies in the gallery yet.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              entry.testimony && (
                <div key={entry.id} className="bg-white shadow rounded-lg p-6">
                  {entry.displayName && (
                    <p className="text-sm text-gray-500 mb-2">By {entry.displayName}</p>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {entry.testimony.title}
                  </h3>
                  <div className="prose max-w-none text-sm">
                    <TestimonyPreview testimony={entry.testimony} />
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

