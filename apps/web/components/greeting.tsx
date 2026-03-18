'use client';

import { authClient } from '@gofree/auth/client';

export function Greeting() {
  const { data: session } = authClient.useSession();

  if (!session?.user?.name) return null;

  const firstName = session.user.name.split(' ')[0];

  return (
    <span className="text-sm font-medium">
      Hello, {firstName}
    </span>
  );
}
