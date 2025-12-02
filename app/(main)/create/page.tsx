'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TestimonyEditor } from '@/components/TestimonyEditor'
import { CreateTestimonyDto } from '@/domain/testimony/types'

export default function CreateTestimonyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      router.push(`/dashboard`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Testimony</h1>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <TestimonyEditor onSave={handleSave} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

