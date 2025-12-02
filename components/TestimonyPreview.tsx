'use client'

import { Testimony } from '@/domain/testimony/types'

interface TestimonyPreviewProps {
  testimony: Testimony
}

export function TestimonyPreview({ testimony }: TestimonyPreviewProps) {
  const renderContent = () => {
    switch (testimony.framework_type) {
      case 'before_encounter_after':
        const beaContent = testimony.content as any
        return (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Before</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{beaContent.before || ''}</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Encounter</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{beaContent.encounter || ''}</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">After</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{beaContent.after || ''}</p>
            </section>
          </div>
        )

      case 'life_timeline':
        const timelineContent = testimony.content as any
        return (
          <div className="space-y-6">
            {timelineContent.milestones?.map((milestone: any, index: number) => (
              <div key={index} className="border-l-4 border-indigo-600 pl-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {milestone.age || `Milestone ${index + 1}`}
                </h3>
                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Event</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{milestone.event || ''}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Impact</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{milestone.impact || ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 'seasons_of_growth':
        const seasonsContent = testimony.content as any
        return (
          <div className="space-y-8">
            {seasonsContent.seasons?.map((season: any, index: number) => (
              <section key={index} className="border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {season.season || `Season ${index + 1}`}
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Challenges</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{season.challenges || ''}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Growth</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{season.growth || ''}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Lessons Learned</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{season.lessons || ''}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )

      case 'free_form':
        const freeFormContent = testimony.content as any
        return (
          <div>
            <p className="text-gray-700 whitespace-pre-wrap">{freeFormContent.narrative || ''}</p>
          </div>
        )

      default:
        return <p className="text-gray-600">No content available</p>
    }
  }

  return (
    <div className="prose max-w-none">
      <div className="mb-6 text-sm text-gray-500">
        Framework: {testimony.framework_type.replace(/_/g, ' ')}
      </div>
      {renderContent()}
    </div>
  )
}

