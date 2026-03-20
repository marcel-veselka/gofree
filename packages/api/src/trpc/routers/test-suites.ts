import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { t, orgProcedure } from '../procedures';
import { checkPermission } from '@gofree/auth';
import { slugify } from '@gofree/core';
import { testSuiteConfigSchema } from '@gofree/db';

const targetTypeEnum = z.enum(['WEB', 'MOBILE', 'DESKTOP', 'API', 'DATABASE', 'CROSS_PLATFORM']);

export const testSuiteRouter = t.router({
  list: orgProcedure
    .input(z.object({
      projectSlug: z.string(),
      archived: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { orgId_slug: { orgId: ctx.org.id, slug: input.projectSlug } },
      });
      if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });

      return ctx.db.testSuite.findMany({
        where: { projectId: project.id, archived: input.archived },
        include: { _count: { select: { testCases: true, runs: true } } },
        orderBy: { name: 'asc' },
      });
    }),

  getBySlug: orgProcedure
    .input(z.object({ projectSlug: z.string(), suiteSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { orgId_slug: { orgId: ctx.org.id, slug: input.projectSlug } },
      });
      if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });

      const suite = await ctx.db.testSuite.findUnique({
        where: { projectId_slug: { projectId: project.id, slug: input.suiteSlug } },
        include: {
          testCases: { orderBy: { position: 'asc' } },
          _count: { select: { runs: true } },
        },
      });
      if (!suite) throw new TRPCError({ code: 'NOT_FOUND', message: 'Test suite not found' });
      return suite;
    }),

  create: orgProcedure
    .input(z.object({
      projectSlug: z.string(),
      name: z.string().min(1).max(100),
      slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
      description: z.string().max(500).optional(),
      targetType: targetTypeEnum,
      config: testSuiteConfigSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'MEMBER')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Member role required' });
      }

      const project = await ctx.db.project.findUnique({
        where: { orgId_slug: { orgId: ctx.org.id, slug: input.projectSlug } },
      });
      if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });

      return ctx.db.testSuite.create({
        data: {
          projectId: project.id,
          name: input.name,
          slug: input.slug ?? slugify(input.name),
          description: input.description,
          targetType: input.targetType,
          config: input.config ?? undefined,
        },
      });
    }),

  update: orgProcedure
    .input(z.object({
      suiteId: z.string(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      config: testSuiteConfigSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'MEMBER')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Member role required' });
      }

      return ctx.db.testSuite.update({
        where: { id: input.suiteId },
        data: {
          name: input.name,
          description: input.description,
          config: input.config ?? undefined,
        },
      });
    }),

  archive: orgProcedure
    .input(z.object({ suiteId: z.string(), archived: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'MEMBER')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Member role required' });
      }

      return ctx.db.testSuite.update({
        where: { id: input.suiteId },
        data: { archived: input.archived },
      });
    }),

  runHistory: orgProcedure
    .input(z.object({ suiteId: z.string(), limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.run.findMany({
        where: { testSuiteId: input.suiteId },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        select: {
          id: true,
          status: true,
          type: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
          _count: { select: { testResults: true } },
        },
      });
    }),
});
