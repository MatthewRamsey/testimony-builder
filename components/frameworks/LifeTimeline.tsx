'use client'

import { useState } from 'react'
import { LifeTimelineContent, LifeTimelineMilestone } from '@/domain/testimony/types'

interface LifeTimelineProps {
  value: Partial<LifeTimelineContent>
  onChange: (value: LifeTimelineContent) => void
}

export function LifeTimeline({ value, onChange }: LifeTimelineProps) {
  const milestones = value.milestones || []

  const handleAddMilestone = () => {
    onChange({
      milestones: [
        ...milestones,
        { age: '', event: '', impact: '' },
      ],
    })
  }

  const handleRemoveMilestone = (index: number) => {
    onChange({
      milestones: milestones.filter((_, i) => i !== index),
    })
  }

  const handleMilestoneChange = (index: number, field: keyof LifeTimelineMilestone, text: string) => {
    const updated = [...milestones]
    updated[index] = { ...updated[index], [field]: text }
    onChange({ milestones: updated })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Life Timeline</h3>
        <button
          type="button"
          onClick={handleAddMilestone}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Add Milestone
        </button>
      </div>

      {milestones.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">
          Click &quot;Add Milestone&quot; to start building your timeline
        </p>
      )}

      {milestones.map((milestone, index) => (
        <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium text-gray-900">Milestone {index + 1}</h4>
            <button
              type="button"
              onClick={() => handleRemoveMilestone(index)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age / Time Period
            </label>
            <input
              type="text"
              value={milestone.age}
              onChange={(e) => handleMilestoneChange(index, 'age', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., Age 20, 2015, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event
            </label>
            <textarea
              rows={3}
              value={milestone.event}
              onChange={(e) => handleMilestoneChange(index, 'event', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="Describe the event or experience..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impact / Significance
            </label>
            <textarea
              rows={3}
              value={milestone.impact}
              onChange={(e) => handleMilestoneChange(index, 'impact', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="How did this impact your faith journey?"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

