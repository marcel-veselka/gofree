'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc';

function CreateOrgForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const createOrg = trpc.org.create.useMutation({
    onSuccess: () => {
      setName('');
      onCreated();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        createOrg.mutate({ name: name.trim() });
      }}
      className="flex gap-2 pt-1"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Organization name"
        required
        className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        type="submit"
        disabled={createOrg.isPending}
        className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {createOrg.isPending ? '...' : 'Create'}
      </button>
    </form>
  );
}

export function OrgSwitcher() {
  const params = useParams();
  const currentOrgSlug = params?.org as string | undefined;
  const [showCreate, setShowCreate] = useState(false);

  const { data: orgs, isLoading, refetch } = trpc.org.list.useQuery();

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
        {showCreate ? (
          <CreateOrgForm onCreated={() => { setShowCreate(false); refetch(); }} />
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Create organization
          </button>
        )}
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
      {showCreate ? (
        <CreateOrgForm onCreated={() => { setShowCreate(false); refetch(); }} />
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Create organization
        </button>
      )}
    </div>
  );
}
