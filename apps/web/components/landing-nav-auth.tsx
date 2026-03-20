'use client';

import Link from 'next/link';
import { authClient } from '@gofree/auth/client';
import { trpc } from '@/lib/trpc';

export function LandingNavAuth() {
  const { data: session, isPending } = authClient.useSession();
  const { data: orgs } = trpc.org.list.useQuery(undefined, {
    enabled: !!session?.user,
  });

  if (isPending) {
    return <div className="h-9 w-24" />; // placeholder to prevent layout shift
  }

  if (session?.user) {
    const dashboardHref = orgs?.[0]?.slug ? `/${orgs[0].slug}` : '/';
    return (
      <Link
        href={dashboardHref}
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
