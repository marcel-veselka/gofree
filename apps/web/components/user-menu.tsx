'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@gofree/auth/client';

export function UserMenu() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!session?.user) return null;

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0]?.toUpperCase() ?? '?';

  async function handleSignOut() {
    await authClient.signOut();
    router.push('/login');
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name ?? ''}
            className="h-7 w-7 rounded-full"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {initials}
          </div>
        )}
        <span className="hidden sm:inline">{user.name ?? user.email}</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-1 w-48 rounded-md border bg-background py-1 shadow-md">
            <div className="border-b px-3 py-2">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
