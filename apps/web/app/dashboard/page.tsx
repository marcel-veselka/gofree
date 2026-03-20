'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

export default function DashboardRedirect() {
  const router = useRouter();
  const { data: orgs, isLoading } = trpc.org.list.useQuery();

  useEffect(() => {
    if (!isLoading && orgs) {
      if (orgs.length > 0 && orgs[0]) {
        router.replace(`/${orgs[0].slug}`);
      } else {
        // No orgs — this shouldn't happen (auto-created on signup), but handle it
        router.replace('/');
      }
    }
  }, [orgs, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  );
}
