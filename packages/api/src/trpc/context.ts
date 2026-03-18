import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { db } from '@gofree/db';

export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  // TODO: Extract session from request headers using Better Auth
  return {
    db,
    session: null as unknown, // Will be typed after auth integration
    headers: opts.req.headers,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
