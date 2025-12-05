'use client'

import { useEffect, useRef } from 'react'

/**
 * Hook to detect when user's mouse leaves the viewport (exit intent)
 * Triggers callback once per session
 *
 * @param callback - Function to call when exit intent is detected
 * @param enabled - Whether the hook is active (default: true)
 */
export function useExitIntent(callback: () => void, enabled: boolean = true) {
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if:
      // 1. Haven't triggered before
      // 2. Mouse is leaving from the top of the viewport
      // 3. Mouse Y position is very close to 0 (at top edge)
      if (
        !hasTriggeredRef.current &&
        e.clientY <= 0 &&
        e.relatedTarget === null
      ) {
        hasTriggeredRef.current = true
        callback()
      }
    }

    // Listen for mouse leaving the document
    document.addEventListener('mouseout', handleMouseLeave)

    return () => {
      document.removeEventListener('mouseout', handleMouseLeave)
    }
  }, [callback, enabled])

  // Provide a way to reset the trigger (useful for testing)
  const reset = () => {
    hasTriggeredRef.current = false
  }

  return { reset }
}
