'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Testimony, FrameworkType } from '@/domain/testimony/types'
import { frameworks, getFrameworkName } from '@/lib/frameworks'

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
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType | 'all'>('all')

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

  const getContentPreview = (testimony: Testimony): string => {
    let preview = ''

    switch (testimony.framework_type) {
      case 'before_encounter_after':
        const beaContent = testimony.content as any
        preview = beaContent.before || beaContent.encounter || beaContent.after || ''
        break
      case 'life_timeline':
        const timelineContent = testimony.content as any
        preview = timelineContent.milestones?.[0]?.event || timelineContent.milestones?.[0]?.impact || ''
        break
      case 'seasons_of_growth':
        const seasonsContent = testimony.content as any
        preview = seasonsContent.seasons?.[0]?.challenges || seasonsContent.seasons?.[0]?.growth || ''
        break
      case 'free_form':
        const freeFormContent = testimony.content as any
        preview = freeFormContent.narrative || ''
        break
    }

    // Truncate to 150 characters
    if (preview.length > 150) {
      preview = preview.substring(0, 150).trim() + '...'
    }

    return preview || 'No content available'
  }

  const filteredEntries = entries.filter((entry) => {
    if (!entry.testimony) return false
    if (selectedFramework === 'all') return true
    return entry.testimony.framework_type === selectedFramework
  })

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

        {/* Framework Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFramework('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFramework === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Frameworks
            </button>
            {frameworks.map((framework) => (
              <button
                key={framework.id}
                onClick={() => setSelectedFramework(framework.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFramework === framework.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {framework.icon} {framework.name}
              </button>
            ))}
          </div>
          {selectedFramework !== 'all' && (
            <p className="mt-3 text-sm text-gray-600">
              Showing {filteredEntries.length} {filteredEntries.length === 1 ? 'testimony' : 'testimonies'} with {getFrameworkName(selectedFramework as FrameworkType)}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {filteredEntries.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-600">
              {selectedFramework === 'all'
                ? 'No testimonies in the gallery yet.'
                : `No testimonies found with ${getFrameworkName(selectedFramework as FrameworkType)} framework.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEntries.map((entry) => (
              entry.testimony && (
                <Link
                  key={entry.id}
                  href={`/preview/${entry.testimony.id}`}
                  className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2 flex-1">
                      {entry.testimony.title}
                    </h3>
                  </div>
                  
                  <div className="mb-3">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                      {getFrameworkName(entry.testimony.framework_type)}
                    </span>
                  </div>

                  {entry.displayName && (
                    <p className="text-xs text-gray-500 mb-2">By {entry.displayName}</p>
                  )}

                  <p className="text-sm text-gray-600 line-clamp-3 flex-1 mb-3">
                    {getContentPreview(entry.testimony)}
                  </p>

                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <span className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                      Read More →
                    </span>
                  </div>
                </Link>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
