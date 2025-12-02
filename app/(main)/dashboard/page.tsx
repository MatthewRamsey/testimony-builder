'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Testimony } from '@/domain/testimony/types'

export default function DashboardPage() {
  const router = useRouter()
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTestimonies()
  }, [])

  const fetchTestimonies = async () => {
    try {
      const response = await fetch('/api/testimonies')
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch testimonies')
      }

      const data = await response.json()
      setTestimonies(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimony?')) {
      return
    }

    try {
      const response = await fetch(`/api/testimonies/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete testimony')
      }

      setTestimonies(testimonies.filter(t => t.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete testimony')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Testimonies</h1>
          <Link
            href="/create"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Create New Testimony
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {testimonies.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-600 mb-4">You haven&apos;t created any testimonies yet.</p>
            <Link
              href="/create"
              className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Create Your First Testimony
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonies.map((testimony) => (
              <div key={testimony.id} className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {testimony.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {testimony.framework_type.replace(/_/g, ' ')}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/edit/${testimony.id}`}
                    className="flex-1 text-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/preview/${testimony.id}`}
                    className="flex-1 text-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500"
                  >
                    Preview
                  </Link>
                  <button
                    onClick={() => handleDelete(testimony.id)}
                    className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

