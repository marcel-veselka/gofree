import { z } from 'zod';
import { t, orgProcedure } from '../procedures';

export const testResultRouter = t.router({
  byRun: orgProcedure
    .input(z.object({ runId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.testResult.findMany({
        where: { runId: input.runId },
        include: {
          testCase: { select: { id: true, title: true, targetType: true, priority: true } },
          assertions: true,
        },
        orderBy: { createdAt: 'asc' },
      });
    }),

  byTestCase: orgProcedure
    .input(z.object({
      testCaseId: z.string(),
      limit: z.number().int().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.testResult.findMany({
        where: { testCaseId: input.testCaseId },
        include: {
          run: { select: { id: true, status: true, createdAt: true } },
          assertions: true,
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      });
    }),

  suiteSummary: orgProcedure
    .input(z.object({ runId: z.string() }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.testResult.findMany({
        where: { runId: input.runId },
        select: { status: true, durationMs: true },
      });

      const total = results.length;
      const passed = results.filter(r => r.status === 'PASSED').length;
      const failed = results.filter(r => r.status === 'FAILED').length;
      const skipped = results.filter(r => r.status === 'SKIPPED').length;
      const flaky = results.filter(r => r.status === 'FLAKY').length;
      const errored = results.filter(r => r.status === 'ERROR').length;
      const totalDurationMs = results.reduce((sum, r) => sum + (r.durationMs ?? 0), 0);
      const passRate = total > 0 ? Math.round((passed / total) * 1000) / 10 : 0;

      return { total, passed, failed, skipped, flaky, errored, totalDurationMs, passRate };
    }),
});
