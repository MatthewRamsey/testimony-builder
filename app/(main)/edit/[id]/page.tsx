'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TestimonyEditor } from '@/components/TestimonyEditor'
import { Testimony, CreateTestimonyDto, UpdateTestimonyDto } from '@/domain/testimony/types'

export default function EditTestimonyPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [testimony, setTestimony] = useState<Testimony | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTestimony()
  }, [id])

  const fetchTestimony = async () => {
    try {
      const response = await fetch(`/api/testimonies/${id}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        if (response.status === 404) {
          router.push('/dashboard')
          return
        }
        throw new Error('Failed to fetch testimony')
      }

      const data = await response.json()
      setTestimony(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (data: CreateTestimonyDto) => {
    setIsSaving(true)
    setError(null)

    try {
      const updateData: UpdateTestimonyDto = {
        title: data.title,
        content: data.content,
      }

      const response = await fetch(`/api/testimonies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update testimony')
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!testimony) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Testimony not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Testimony</h1>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <TestimonyEditor
            initialTitle={testimony.title}
            initialFramework={testimony.framework_type}
            initialContent={testimony.content}
            onSave={handleSave}
            isLoading={isSaving}
          />
        </div>
      </div>
    </div>
  )
}

