import { z } from 'zod';
import { t, orgProcedure } from '../procedures';

export const dashboardRouter = t.router({
  stats: orgProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      const orgId = ctx.org.id;

      // All projects in this org
      const projects = await ctx.db.project.findMany({
        where: { orgId },
        select: { id: true },
      });
      const projectIds = projects.map((p) => p.id);
      const projectCount = projectIds.length;

      if (projectCount === 0) {
        return {
          projectCount: 0,
          suiteCount: 0,
          caseCount: 0,
          runCount: 0,
          lastRunStatus: null as string | null,
          lastRunDate: null as Date | null,
          passRate: null as number | null,
        };
      }

      // Aggregate counts in parallel
      const [suiteCount, caseCount, runCount, lastRun, recentRuns] =
        await Promise.all([
          ctx.db.testSuite.count({
            where: { projectId: { in: projectIds } },
          }),
          ctx.db.testCase.count({
            where: { suite: { projectId: { in: projectIds } } },
          }),
          ctx.db.run.count({
            where: { projectId: { in: projectIds } },
          }),
          ctx.db.run.findFirst({
            where: { projectId: { in: projectIds } },
            orderBy: { createdAt: 'desc' },
            select: { status: true, createdAt: true },
          }),
          ctx.db.run.findMany({
            where: { projectId: { in: projectIds } },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: { status: true },
          }),
        ]);

      // Pass rate from last 10 runs: ratio of COMPLETED to total
      let passRate: number | null = null;
      if (recentRuns.length > 0) {
        const completed = recentRuns.filter(
          (r) => r.status === 'COMPLETED',
        ).length;
        passRate = Math.round((completed / recentRuns.length) * 100);
      }

      return {
        projectCount,
        suiteCount,
        caseCount,
        runCount,
        lastRunStatus: lastRun?.status ?? null,
        lastRunDate: lastRun?.createdAt ?? null,
        passRate,
      };
    }),

  recentRuns: orgProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      const orgId = ctx.org.id;

      const projects = await ctx.db.project.findMany({
        where: { orgId },
        select: { id: true },
      });
      const projectIds = projects.map((p) => p.id);

      if (projectIds.length === 0) return [];

      return ctx.db.run.findMany({
        where: { projectId: { in: projectIds } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          status: true,
          createdAt: true,
          testSuite: { select: { name: true } },
          _count: { select: { testResults: true } },
        },
      });
    }),
});
