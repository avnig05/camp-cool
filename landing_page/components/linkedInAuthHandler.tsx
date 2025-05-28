"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

// Define AUTH_STATUSES here or import from a shared constants file
const AUTH_STATUSES = {
  SUCCESS: 'success',
  ERROR: 'error',
  FAILED: 'failed',
} as const;

export default function LinkedInAuthHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('linkedin_auth_status');
    const error = searchParams.get('linkedin_error');
    const errorDescription = searchParams.get('linkedin_error_description');

    if (status === AUTH_STATUSES.SUCCESS) {
      toast.success('Successfully connected with LinkedIn!');
    } else if (status === AUTH_STATUSES.ERROR || status === AUTH_STATUSES.FAILED) {
      toast.error(errorDescription || error || 'Failed to connect with LinkedIn. Please try again.');
    }
    
    // Clean up URL parameters
    if (typeof window !== 'undefined') {
      if (status || error || errorDescription) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('linkedin_auth_status');
        currentUrl.searchParams.delete('linkedin_error');
        currentUrl.searchParams.delete('linkedin_error_description');
        window.history.replaceState({}, document.title, currentUrl.pathname + currentUrl.search);
      }
    }
  }, [searchParams]);

  return null; // This component does not render any visible UI
}
