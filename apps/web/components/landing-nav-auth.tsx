'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Session-aware nav for the landing page.
 * Only checks auth if a session cookie exists — avoids unnecessary
 * API calls and browser permission prompts for anonymous visitors.
 */
export function LandingNavAuth() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // Check for Better Auth session cookie without making an API call
    const hasCookie = document.cookie
      .split(';')
      .some((c) => c.trim().startsWith('better-auth.session_token='));
    setHasSession(hasCookie);
  }, []);

  if (hasSession) {
    return (
      <Link
        href="/"
        className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-violet-200 transition-all hover:shadow-lg hover:shadow-violet-300"
      >
        Go to Dashboard
      </Link>
    );
  }

  return (
    <>
      <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground">
        Sign in
      </Link>
      <Link href="/signup" className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-violet-200 transition-all hover:shadow-lg hover:shadow-violet-300">
        Start free trial
      </Link>
    </>
  );
}
