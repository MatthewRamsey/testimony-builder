'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { FileText, Download, Share2 } from 'lucide-react'
import { PenNibIcon } from '@/components/icons/PenNibIcon'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`text-center transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [penReady, setPenReady] = useState(false)
  const penFlightDelayMs = 2000
  const heroRef = useRef<HTMLDivElement>(null)
  const heroDesktopAnchorRef = useRef<HTMLSpanElement>(null)
  const heroMobileAnchorRef = useRef<HTMLSpanElement>(null)
  const penRef = useRef<HTMLSpanElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    let frame = 0
    const updatePenPosition = () => {
      if (!heroRef.current || !penRef.current || !ctaRef.current) return

      const heroRect = heroRef.current.getBoundingClientRect()
      const anchorRect =
        [heroMobileAnchorRef.current, heroDesktopAnchorRef.current]
          .map((anchor) => anchor?.getBoundingClientRect())
          .find((rect) => rect && rect.width > 0 && rect.height > 0) ?? null
      const ctaRect = ctaRef.current.getBoundingClientRect()
      const penRect = penRef.current.getBoundingClientRect()

      if (!penRect.width || !penRect.height) return

      const startX = anchorRect ? anchorRect.left + anchorRect.width / 2 : heroRect.left + heroRect.width / 2
      const startY = anchorRect ? anchorRect.top + anchorRect.height / 2 : heroRect.top + heroRect.height * 0.25
      const endX = penRect.left + penRect.width / 2
      const endY = penRect.top + penRect.height / 2

      penRef.current.style.setProperty('--pen-start-x', `${startX - endX}px`)
      penRef.current.style.setProperty('--pen-start-y', `${startY - endY}px`)
      penRef.current.style.setProperty('--pen-start-scale', '3.6')
      penRef.current.style.setProperty('--pen-flight-duration', '1400ms')
      penRef.current.style.setProperty('--pen-flight-delay', `${penFlightDelayMs}ms`)
      penRef.current.style.setProperty('--pen-color-duration', '220ms')

      const travelY = endY - startY
      const borderY = ctaRect.top + penRect.height / 2
      const rawProgress = travelY === 0 ? 1 : (borderY - startY) / travelY
      const clampedProgress = Math.min(1, Math.max(0, rawProgress))
      const colorDelayMs = Math.max(0, Math.round(1400 * clampedProgress - 650))
      penRef.current.style.setProperty('--pen-color-delay', `${colorDelayMs}ms`)
      setPenReady(true)
    }

    frame = window.requestAnimationFrame(updatePenPosition)
    window.addEventListener('resize', updatePenPosition)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updatePenPosition)
    }
  }, [isLoaded])

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <div
          ref={heroRef}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white"
        >
          {/* Gradient orbs for depth */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="text-center">
              {/* Main heading with icon */}
              <div className="sm:hidden mb-3 flex justify-center">
                <span
                  ref={heroMobileAnchorRef}
                  aria-hidden="true"
                  className={`inline-flex text-indigo-100 transition-opacity duration-700 ${
                    penReady ? 'opacity-0' : isLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ transitionDelay: penReady ? `${penFlightDelayMs}ms` : '0ms' }}
                >
                  <PenNibIcon className="w-10 h-10" />
                </span>
              </div>
              <h1
                className={`text-5xl lg:text-6xl font-extrabold mb-6 transition-all duration-700 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <span className="relative inline-flex items-center">
                  <span className="bg-gradient-to-r from-white via-white to-indigo-200 bg-clip-text text-transparent pb-1">
                    Testimony Pro
                  </span>
                  <span
                    ref={heroDesktopAnchorRef}
                    aria-hidden="true"
                    className="absolute -left-[50px] top-1/2 h-6 w-6 -translate-y-1/2 opacity-0 hidden sm:inline"
                  />
                </span>
              </h1>

              {/* Tagline */}
              <p
                className={`text-xl lg:text-2xl mb-4 max-w-2xl mx-auto text-indigo-100 transition-all duration-700 delay-100 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Craft your personal faith testimony with guided storytelling frameworks.
              </p>
              <p
                className={`text-lg mb-8 text-indigo-200 transition-all duration-700 delay-150 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Share your journey, inspire others, preserve your story.
              </p>

              {/* Trust indicators */}
              <div
                className={`flex flex-wrap justify-center gap-4 sm:gap-6 text-indigo-200 mb-8 text-sm transition-all duration-700 delay-200 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-300" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  No sign-up required
                </span>
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-300" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Start in 30 seconds
                </span>
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-300" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  100% free to try
                </span>
              </div>

              {/* CTA buttons */}
              <div
                className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 delay-300 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <Link
                  href="/create/choose-framework"
                  ref={ctaRef}
                  className="group relative rounded-xl bg-white px-8 py-4 text-lg font-bold text-indigo-600 shadow-lg shadow-indigo-900/30 hover:bg-indigo-50 hover:shadow-xl hover:shadow-indigo-900/40 hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center justify-center gap-2 overflow-visible"
                >
                  <span
                    ref={penRef}
                    aria-hidden="true"
                    className={`inline-flex w-5 h-5 origin-center text-white motion-reduce:text-indigo-600 ${
                      penReady ? 'pen-flight motion-reduce:animate-none' : 'opacity-0'
                    }`}
                  >
                    <PenNibIcon className="w-5 h-5" />
                  </span>
                  Start Writing Now
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  href="/gallery"
                  className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 text-base font-semibold text-white hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center justify-center"
                >
                  View Gallery
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom wave - animated drift */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
            <svg
              viewBox="0 0 2880 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              className="w-[200%] h-12 sm:h-16 animate-wave-drift"
            >
              {/* Seamless wave - pattern tiles at 1440px */}
              <path
                d="M0 55 Q360 40 720 55 Q1080 70 1440 55 Q1800 40 2160 55 Q2520 70 2880 55 L2880 80 L0 80 Z"
                fill="rgb(249 250 251)"
              />
            </svg>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Everything you need to tell your story
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose from multiple frameworks or write freely. Your testimony, your way.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<FileText className="w-8 h-8 text-indigo-600" />}
                title="Multiple Frameworks"
                description="Choose from Before - Encounter - After, Life Timeline, Seasons of Growth, or Free-Form to structure your story"
                delay={0}
              />
              <FeatureCard
                icon={<Download className="w-8 h-8 text-indigo-600" />}
                title="PDF Export"
                description="Export your testimony as a beautiful PDF document to share or keep forever"
                delay={100}
              />
              <FeatureCard
                icon={<Share2 className="w-8 h-8 text-indigo-600" />}
                title="Read-Only Sharing"
                description="Share a clean, read-only link so others can read your story without editing"
                delay={200}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
