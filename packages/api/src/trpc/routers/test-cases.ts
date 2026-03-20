import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { t, orgProcedure } from '../procedures';
import { checkPermission } from '@gofree/auth';
import { testCaseStepsSchema, testCaseAssertionsSchema } from '@gofree/db';

const targetTypeEnum = z.enum(['WEB', 'MOBILE', 'DESKTOP', 'API', 'DATABASE', 'CROSS_PLATFORM']);
const priorityEnum = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);

export const testCaseRouter = t.router({
  list: orgProcedure
    .input(z.object({
      suiteId: z.string(),
      tag: z.string().optional(),
      targetType: targetTypeEnum.optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.testCase.findMany({
        where: {
          suiteId: input.suiteId,
          ...(input.tag ? { tags: { has: input.tag } } : {}),
          ...(input.targetType ? { targetType: input.targetType } : {}),
        },
        orderBy: { position: 'asc' },
      });
    }),

  getById: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const testCase = await ctx.db.testCase.findUnique({
        where: { id: input.id },
        include: { suite: true },
      });
      if (!testCase) throw new TRPCError({ code: 'NOT_FOUND', message: 'Test case not found' });
      return testCase;
    }),

  create: orgProcedure
    .input(z.object({
      suiteId: z.string(),
      title: z.string().min(1).max(200),
      targetType: targetTypeEnum,
      priority: priorityEnum.default('MEDIUM'),
      steps: testCaseStepsSchema.optional(),
      expectedAssertions: testCaseAssertionsSchema.optional(),
      targetConfig: z.record(z.unknown()).optional(),
      tags: z.array(z.string()).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'MEMBER')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Member role required' });
      }

      // Get next position
      const maxPos = await ctx.db.testCase.aggregate({
        where: { suiteId: input.suiteId },
        _max: { position: true },
      });

      return ctx.db.testCase.create({
        data: {
          suiteId: input.suiteId,
          title: input.title,
          targetType: input.targetType,
          priority: input.priority,
          position: (maxPos._max.position ?? -1) + 1,
          steps: input.steps as any ?? undefined,
          expectedAssertions: input.expectedAssertions as any ?? undefined,
          targetConfig: input.targetConfig as any ?? undefined,
          tags: input.tags,
        },
      });
    }),

  update: orgProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).max(200).optional(),
      priority: priorityEnum.optional(),
      steps: testCaseStepsSchema.optional(),
      expectedAssertions: testCaseAssertionsSchema.optional(),
      targetConfig: z.record(z.unknown()).optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'MEMBER')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Member role required' });
      }

      const { id, title, priority, steps, expectedAssertions, targetConfig, tags } = input;
      return ctx.db.testCase.update({
        where: { id },
        data: {
          title,
          priority,
          steps: steps as any ?? undefined,
          expectedAssertions: expectedAssertions as any ?? undefined,
          targetConfig: targetConfig as any ?? undefined,
          tags,
        },
      });
    }),

  reorder: orgProcedure
    .input(z.object({
      suiteId: z.string(),
      orderedIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'MEMBER')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Member role required' });
      }

      await ctx.db.$transaction(
        input.orderedIds.map((id, index) =>
          ctx.db.testCase.update({ where: { id }, data: { position: index } })
        )
      );
      return { success: true };
    }),

  delete: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'MEMBER')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Member role required' });
      }

      await ctx.db.testCase.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
