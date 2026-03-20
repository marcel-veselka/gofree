import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { t, orgProcedure } from '../procedures';
import { checkPermission } from '@gofree/auth';

export const runRouter = t.router({
  trigger: orgProcedure
    .input(z.object({
      suiteId: z.string(),
      environmentId: z.string().optional(),
      agentDefinitionId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'MEMBER')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Member role required to trigger runs' });
      }

      // Load suite to get projectId
      const suite = await ctx.db.testSuite.findUnique({
        where: { id: input.suiteId },
        include: { project: true },
      });
      if (!suite) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Test suite not found' });
      }

      // Resolve environment — use provided, or project default
      let environmentId = input.environmentId;
      if (!environmentId) {
        const defaultEnv = await ctx.db.testEnvironment.findFirst({
          where: { projectId: suite.projectId, isDefault: true },
        });
        environmentId = defaultEnv?.id;
      }

      // Resolve agent definition — use provided, or latest in project
      let agentDefinitionId = input.agentDefinitionId;
      if (!agentDefinitionId) {
        const latestAgent = await ctx.db.agentDefinition.findFirst({
          where: { projectId: suite.projectId },
          orderBy: [{ version: 'desc' }],
        });
        agentDefinitionId = latestAgent?.id;
      }

      // Create Run record
      const run = await ctx.db.run.create({
        data: {
          projectId: suite.projectId,
          userId: ctx.user.id,
          type: 'TEST',
          status: 'PENDING',
          testSuiteId: input.suiteId,
          environmentId: environmentId ?? undefined,
          agentDefinitionId: agentDefinitionId ?? undefined,
        },
      });

      // Execute the run — in dev mode, run directly; in prod, enqueue via Trigger.dev
      const { runTestSuite } = await import('@gofree/ai');
      // Fire and forget — don't await, return runId immediately
      runTestSuite({ runId: run.id }).catch((err) => {
        console.error(`[run.trigger] Run ${run.id} failed:`, err);
      });

      return { runId: run.id };
    }),

  getById: orgProcedure
    .input(z.object({ runId: z.string() }))
    .query(async ({ ctx, input }) => {
      const run = await ctx.db.run.findUnique({
        where: { id: input.runId },
        include: {
          testSuite: { select: { name: true, slug: true } },
          steps: { orderBy: { index: 'asc' as const } },
          testResults: {
            include: {
              testCase: { select: { title: true, targetType: true, priority: true } },
              assertions: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
      if (!run) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Run not found' });
      }
      return run;
    }),
});
