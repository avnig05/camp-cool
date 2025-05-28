"use client";

import { usePathname, useSearchParams } from 'next/navigation';
// It's good practice to alias imports if they might conflict or for clarity
import { PostHogProvider as PHProviderLib } from 'posthog-js/react';
import posthog from 'posthog-js';
import { useEffect, Suspense, ReactNode } from 'react'; // Import Suspense and ReactNode

// Initialize PostHog client-side
if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  // The api_host should point to your Next.js app's ingest endpoint if you're proxying,
  // or directly to PostHog's ingest if not. Vercel recommends proxying via /ingest.
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_API_HOST || "/ingest"; // Ensure this is correct

  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_UI_HOST || "https://us.posthog.com", // Typically only needed if self-hosting PostHog UI
      capture_pageview: false, // We capture pageviews manually with PostHogPageviewTracker
      capture_pageleave: true,
      capture_exceptions: true,
      debug: process.env.NODE_ENV === 'development',
      loaded: (posthogInstance) => { // Renamed parameter to avoid conflict
        if (process.env.NODE_ENV === 'development') posthogInstance.debug();
      }
    });
  } else {
    console.warn("PostHog API Key not found (NEXT_PUBLIC_POSTHOG_KEY). PostHog will not be initialized.");
  }
}

function PostHogPageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Ensure PostHog is initialized and we have a pathname
    // You might also check if posthog.has_opted_in_capturing() if you have opt-out mechanisms
    if (pathname && posthog && typeof window !== 'undefined') {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url = url + `?${search}`;
      }
      posthog.capture('$pageview', {
        '$current_url': url,
      });
    }
  }, [pathname, searchParams]); // Dependencies for the effect

  return null; // This component doesn't render any visible UI
}

export function CSPostHogProvider({ children }: { children: ReactNode }) {
  return (
    <PHProviderLib client={posthog}> {/* Use the aliased import */}
      <Suspense fallback={null}> {/* Wrap PostHogPageviewTracker in Suspense */}
        <PostHogPageviewTracker />
      </Suspense>
      {children}
    </PHProviderLib>
  );
}
