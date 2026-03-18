import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { TRPCContext } from './context';
import { orgRouter } from './routers/org';
import { projectRouter } from './routers/project';

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const appRouter = t.router({
  org: orgRouter,
  project: projectRouter,
  // spec: specRouter,
  // run: runRouter,
  // conversation: conversationRouter,
  // ai: aiRouter,
  // search: searchRouter,
  // mcp: mcpRouter,
});

export type AppRouter = typeof appRouter;

// Export reusable procedure builders
export const createRouter = t.router;
export const publicProcedure = t.procedure;
