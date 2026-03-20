import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { t, orgProcedure } from '../procedures';
import { checkPermission } from '@gofree/auth';
import { slugify } from '@gofree/core';
import { agentToolsSchema, agentDefaultConfigSchema } from '@gofree/db';

const targetTypeEnum = z.enum(['WEB', 'MOBILE', 'DESKTOP', 'API', 'DATABASE', 'CROSS_PLATFORM']);

export const agentDefinitionRouter = t.router({
  list: orgProcedure
    .input(z.object({ projectSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { orgId_slug: { orgId: ctx.org.id, slug: input.projectSlug } },
      });
      if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });

      return ctx.db.agentDefinition.findMany({
        where: { projectId: project.id },
        orderBy: [{ name: 'asc' }, { version: 'desc' }],
        include: { _count: { select: { runs: true } } },
      });
    }),

  getBySlug: orgProcedure
    .input(z.object({
      projectSlug: z.string(),
      agentSlug: z.string(),
      version: z.number().int().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { orgId_slug: { orgId: ctx.org.id, slug: input.projectSlug } },
      });
      if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });

      if (input.version) {
        const agent = await ctx.db.agentDefinition.findUnique({
          where: {
            projectId_slug_version: {
              projectId: project.id,
              slug: input.agentSlug,
              version: input.version,
            },
          },
        });
        if (!agent) throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent definition not found' });
        return agent;
      }

      // Return latest version
      const agent = await ctx.db.agentDefinition.findFirst({
        where: { projectId: project.id, slug: input.agentSlug },
        orderBy: { version: 'desc' },
      });
      if (!agent) throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent definition not found' });
      return agent;
    }),

  create: orgProcedure
    .input(z.object({
      projectSlug: z.string(),
      name: z.string().min(1).max(100),
      slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
      promptTemplate: z.string().min(1).max(10000),
      tools: agentToolsSchema.optional(),
      model: z.string().default('claude-sonnet-4-20250514'),
      supportedTargets: z.array(targetTypeEnum).min(1),
      defaultConfig: agentDefaultConfigSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'MEMBER')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Member role required' });
      }

      const project = await ctx.db.project.findUnique({
        where: { orgId_slug: { orgId: ctx.org.id, slug: input.projectSlug } },
      });
      if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });

      return ctx.db.agentDefinition.create({
        data: {
          projectId: project.id,
          name: input.name,
          slug: input.slug ?? slugify(input.name),
          promptTemplate: input.promptTemplate,
          tools: input.tools as any ?? undefined,
          model: input.model,
          supportedTargets: input.supportedTargets,
          defaultConfig: input.defaultConfig as any ?? undefined,
        },
      });
    }),

  createVersion: orgProcedure
    .input(z.object({
      agentId: z.string(),
      promptTemplate: z.string().min(1).max(10000).optional(),
      tools: agentToolsSchema.optional(),
      model: z.string().optional(),
      supportedTargets: z.array(targetTypeEnum).optional(),
      defaultConfig: agentDefaultConfigSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'MEMBER')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Member role required' });
      }

      const current = await ctx.db.agentDefinition.findUnique({ where: { id: input.agentId } });
      if (!current) throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent definition not found' });

      return ctx.db.agentDefinition.create({
        data: {
          projectId: current.projectId,
          name: current.name,
          slug: current.slug,
          promptTemplate: input.promptTemplate ?? current.promptTemplate,
          tools: (input.tools ?? current.tools) as any,
          model: input.model ?? current.model,
          supportedTargets: input.supportedTargets ?? current.supportedTargets,
          defaultConfig: (input.defaultConfig ?? current.defaultConfig) as any,
          version: current.version + 1,
        },
      });
    }),

  versions: orgProcedure
    .input(z.object({ projectSlug: z.string(), agentSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { orgId_slug: { orgId: ctx.org.id, slug: input.projectSlug } },
      });
      if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });

      return ctx.db.agentDefinition.findMany({
        where: { projectId: project.id, slug: input.agentSlug },
        orderBy: { version: 'desc' },
        select: { id: true, version: true, model: true, createdAt: true },
      });
    }),
});
