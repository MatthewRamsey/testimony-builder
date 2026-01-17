'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PenNibIcon } from '@/components/icons/PenNibIcon'

export function Navigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        checkAnonymousStatus(user.id)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkAnonymousStatus(session.user.id)
      } else {
        setIsAnonymous(false)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAnonymousStatus = async (userId: string) => {
    try {
      const response = await fetch('/api/users/anonymous/check')
      const { isAnonymous } = await response.json()
      setIsAnonymous(isAnonymous)
    } catch (error) {
      console.error('Error checking anonymous status:', error)
      setIsAnonymous(false)
    } finally {
      setIsLoading(false)
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="group flex items-center gap-2 px-2 py-2">
              <span id="nav-pen-icon" className="inline-flex">
                <PenNibIcon className="w-7 h-7 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
              </span>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Testimony Pro
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/gallery"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/gallery')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Gallery
              </Link>
              <Link
                href="/create/choose-framework"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/create') || isActive('/create/choose-framework')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Create
              </Link>
              {user && !isAnonymous && (
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/dashboard')
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {isLoading ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                >
                  Sign In
                </Link>
                <div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ) : user && isAnonymous ? (
              // Anonymous user: Show prominent "Sign Up to Save" button
              <Link
                href="/login?intent=save_testimony"
                className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
              >
                Sign Up to Save
              </Link>
            ) : user ? (
              // Authenticated user: Show Sign Out
              <button
                onClick={async () => {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  window.location.href = '/'
                }}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            ) : (
              // No user: Show Sign In
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
