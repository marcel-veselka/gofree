'use client';

import { authClient } from '@gofree/auth/client';

export function Greeting() {
  const { data: session } = authClient.useSession();

  const firstName = session?.user?.name?.split(' ')[0] ?? session?.user?.email?.split('@')[0] ?? 'there';

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <span className="text-sm font-medium">
      {timeGreeting}, {firstName}
    </span>
  );
}
