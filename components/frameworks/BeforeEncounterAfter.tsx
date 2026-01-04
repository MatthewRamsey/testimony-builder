'use client'

import { BeforeEncounterAfterContent } from '@/domain/testimony/types'

interface BeforeEncounterAfterProps {
  value: Partial<BeforeEncounterAfterContent>
  onChange: (value: BeforeEncounterAfterContent) => void
}

export function BeforeEncounterAfter({ value, onChange }: BeforeEncounterAfterProps) {
  const handleChange = (field: keyof BeforeEncounterAfterContent, text: string) => {
    onChange({
      before: value.before || '',
      encounter: value.encounter || '',
      after: value.after || '',
      [field]: text,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="before" className="block text-sm font-medium text-gray-700 mb-2">
          Before
        </label>
        <textarea
          id="before"
          rows={6}
          value={value.before || ''}
          onChange={(e) => handleChange('before', e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          placeholder="Describe your life before your encounter with faith..."
        />
      </div>

      <div>
        <label htmlFor="encounter" className="block text-sm font-medium text-gray-700 mb-2">
          Encounter
        </label>
        <textarea
          id="encounter"
          rows={6}
          value={value.encounter || ''}
          onChange={(e) => handleChange('encounter', e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          placeholder="Describe your encounter with faith, God, or your spiritual awakening..."
        />
      </div>

      <div>
        <label htmlFor="after" className="block text-sm font-medium text-gray-700 mb-2">
          After
        </label>
        <textarea
          id="after"
          rows={6}
          value={value.after || ''}
          onChange={(e) => handleChange('after', e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          placeholder="Describe how your life has changed after your encounter..."
        />
      </div>
    </div>
  )
}


