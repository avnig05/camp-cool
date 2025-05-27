'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { PostHogProvider } from 'posthog-js/react'
import posthog from 'posthog-js'
import { useEffect } from 'react'

if (typeof window !== 'undefined') { // Check if window is defined (running on client)
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (posthogKey && posthogHost) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      // Enable debug mode in development
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      }
    })
  } else {
    console.warn("PostHog API Key or Host not found. PostHog will not be initialized.")
  }
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <PostHogPageviewTracker />
      {children}
    </PostHogProvider>
  )
}

function PostHogPageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture('$pageview', {
        '$current_url': url,
      })
    }
  }, [pathname, searchParams])

  return null
} 