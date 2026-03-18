'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc';

export function OrgSwitcher() {
  const params = useParams();
  const currentOrgSlug = params?.org as string | undefined;

  const { data: orgs, isLoading } = trpc.org.list.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Organizations</p>
        <div className="h-8 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!orgs || orgs.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Organizations</p>
        <p className="text-sm text-muted-foreground">No organizations yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase text-muted-foreground">Organizations</p>
      <nav className="space-y-1">
        {orgs.map((org) => {
          const isActive = org.slug === currentOrgSlug;
          return (
            <Link
              key={org.id}
              href={`/${org.slug}`}
              className={`block rounded-md px-3 py-2 text-sm ${
                isActive
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'hover:bg-accent text-foreground'
              }`}
            >
              {org.name}
              <span className="ml-2 text-xs opacity-60">{org.role}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
