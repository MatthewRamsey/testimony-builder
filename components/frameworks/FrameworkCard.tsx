'use client'

import { FrameworkType } from '@/domain/testimony/types'
import { FrameworkConfig } from '@/lib/frameworks'

interface FrameworkCardProps {
  framework: FrameworkConfig
  onClick: (frameworkType: FrameworkType) => void
}

export function FrameworkCard({ framework, onClick }: FrameworkCardProps) {
  const renderVisualPreview = () => {
    switch (framework.visualStructure.type) {
      case 'progression':
        return (
          <div className="flex items-center justify-center gap-2 my-4">
            {framework.visualStructure.elements.map((element, index) => (
              <div key={index} className="flex items-center">
                <div className="bg-indigo-100 border-2 border-indigo-300 rounded-lg px-4 py-2 text-sm font-medium text-indigo-700">
                  {element}
                </div>
                {index < framework.visualStructure.elements.length - 1 && (
                  <svg className="w-6 h-6 text-indigo-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        )
      case 'timeline':
        return (
          <div className="my-4">
            <div className="flex items-center justify-center gap-2">
              {framework.visualStructure.elements.slice(0, 3).map((element, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full border-2 border-indigo-300"></div>
                  {index < 2 && <div className="w-12 h-0.5 bg-indigo-300"></div>}
                </div>
              ))}
              <span className="text-xs text-gray-500 ml-2">...</span>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">Multiple milestones</p>
          </div>
        )
      case 'seasons':
        return (
          <div className="my-4">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {framework.visualStructure.elements.slice(0, 3).map((element, index) => (
                <div key={index} className="bg-indigo-50 border border-indigo-200 rounded px-3 py-1.5 text-xs font-medium text-indigo-700">
                  {element}
                </div>
              ))}
              <span className="text-xs text-gray-500">...</span>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">Multiple seasons</p>
          </div>
        )
      case 'narrative':
        return (
          <div className="my-4">
            <div className="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-lg p-6 text-center">
              <svg className="w-8 h-8 text-indigo-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="text-sm text-indigo-700 font-medium">Your Story</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <button
      onClick={() => onClick(framework.id)}
      className="group relative bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-indigo-400 hover:shadow-lg transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{framework.icon}</span>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {framework.name}
          </h3>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      
      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
        {framework.briefDescription}
      </p>

      {renderVisualPreview()}

      <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium group-hover:underline">
        Learn more
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}

