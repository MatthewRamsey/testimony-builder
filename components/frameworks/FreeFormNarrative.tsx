'use client'

import { FreeFormContent } from '@/domain/testimony/types'

interface FreeFormNarrativeProps {
  value: Partial<FreeFormContent>
  onChange: (value: FreeFormContent) => void
}

export function FreeFormNarrative({ value, onChange }: FreeFormNarrativeProps) {
  return (
    <div>
      <label htmlFor="narrative" className="block text-sm font-medium text-gray-700 mb-2">
        Your Story
      </label>
      <textarea
        id="narrative"
        rows={20}
        value={value.narrative || ''}
        onChange={(e) => onChange({ narrative: e.target.value })}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        placeholder="Write your testimony in your own words. Share your journey, experiences, and how your faith has shaped your life..."
      />
      <p className="mt-2 text-sm text-gray-500">
        {value.narrative?.length || 0} characters
      </p>
    </div>
  )
}

