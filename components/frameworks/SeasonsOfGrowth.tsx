'use client'

import { useState } from 'react'
import { SeasonsOfGrowthContent, Season } from '@/domain/testimony/types'

interface SeasonsOfGrowthProps {
  value: Partial<SeasonsOfGrowthContent>
  onChange: (value: SeasonsOfGrowthContent) => void
}

export function SeasonsOfGrowth({ value, onChange }: SeasonsOfGrowthProps) {
  const seasons = value.seasons || []

  const handleAddSeason = () => {
    onChange({
      seasons: [
        ...seasons,
        { season: '', challenges: '', growth: '', lessons: '' },
      ],
    })
  }

  const handleRemoveSeason = (index: number) => {
    onChange({
      seasons: seasons.filter((_, i) => i !== index),
    })
  }

  const handleSeasonChange = (index: number, field: keyof Season, text: string) => {
    const updated = [...seasons]
    updated[index] = { ...updated[index], [field]: text }
    onChange({ seasons: updated })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Seasons of Growth</h3>
        <button
          type="button"
          onClick={handleAddSeason}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Add Season
        </button>
      </div>

      {seasons.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">
          Click &quot;Add Season&quot; to start documenting your seasons of growth
        </p>
      )}

      {seasons.map((season, index) => (
        <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium text-gray-900">Season {index + 1}</h4>
            <button
              type="button"
              onClick={() => handleRemoveSeason(index)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Season Name / Period
            </label>
            <input
              type="text"
              value={season.season}
              onChange={(e) => handleSeasonChange(index, 'season', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., College Years, Early Career, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Challenges
            </label>
            <textarea
              rows={3}
              value={season.challenges}
              onChange={(e) => handleSeasonChange(index, 'challenges', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="What challenges did you face during this season?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Growth
            </label>
            <textarea
              rows={3}
              value={season.growth}
              onChange={(e) => handleSeasonChange(index, 'growth', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="How did you grow during this season?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lessons Learned
            </label>
            <textarea
              rows={3}
              value={season.lessons}
              onChange={(e) => handleSeasonChange(index, 'lessons', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="What lessons did you learn?"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

