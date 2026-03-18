import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { db } from '@gofree/db';
import { auth } from '@gofree/auth';

export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const session = await auth.api.getSession({
    headers: opts.req.headers,
  });

  return {
    db,
    session,
    headers: opts.req.headers,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
