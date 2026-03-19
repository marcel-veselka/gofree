'use client';

import { authClient } from '@gofree/auth/client';

export function Greeting() {
  const { data: session } = authClient.useSession();

  const firstName = session?.user?.name?.split(' ')[0] ?? session?.user?.email?.split('@')[0] ?? 'there';

  return (
    <span className="text-sm font-medium">
      Hello, {firstName}
    </span>
  );
}
