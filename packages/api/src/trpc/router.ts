import { t } from './procedures';
import { orgRouter } from './routers/org';
import { projectRouter } from './routers/project';
import { memberRouter } from './routers/member';

export { publicProcedure, protectedProcedure, orgProcedure } from './procedures';

export const appRouter = t.router({
  org: orgRouter,
  project: projectRouter,
  member: memberRouter,
});

export type AppRouter = typeof appRouter;
