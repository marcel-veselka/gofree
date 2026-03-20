import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { t, orgProcedure } from '../procedures';
import { checkPermission } from '@gofree/auth';
import { slugify } from '@gofree/core';
import { environmentConfigSchema, environmentSecretsSchema } from '@gofree/db';

const targetTypeEnum = z.enum(['WEB', 'MOBILE', 'DESKTOP', 'API', 'DATABASE', 'CROSS_PLATFORM']);

function maskSecrets(secrets: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!secrets) return null;
  const masked: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(secrets)) {
    if (typeof val === 'object' && val !== null) {
      masked[key] = Object.fromEntries(
        Object.keys(val as Record<string, unknown>).map(k => [k, '***'])
      );
    } else {
      masked[key] = '***';
    }
  }
  return masked;
}

export const testEnvironmentRouter = t.router({
  list: orgProcedure
    .input(z.object({ projectSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { orgId_slug: { orgId: ctx.org.id, slug: input.projectSlug } },
      });
      if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });

      const envs = await ctx.db.testEnvironment.findMany({
        where: { projectId: project.id },
        orderBy: { name: 'asc' },
      });

      return envs.map(env => ({
        ...env,
        secrets: maskSecrets(env.secrets as Record<string, unknown> | null),
      }));
    }),

  getBySlug: orgProcedure
    .input(z.object({
      projectSlug: z.string(),
      envSlug: z.string(),
      reveal: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { orgId_slug: { orgId: ctx.org.id, slug: input.projectSlug } },
      });
      if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });

      const env = await ctx.db.testEnvironment.findUnique({
        where: { projectId_slug: { projectId: project.id, slug: input.envSlug } },
      });
      if (!env) throw new TRPCError({ code: 'NOT_FOUND', message: 'Environment not found' });

      if (!input.reveal) {
        return { ...env, secrets: maskSecrets(env.secrets as Record<string, unknown> | null) };
      }

      // Only admins can reveal secrets
      if (!checkPermission(ctx.orgRole, 'ADMIN')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin role required to reveal secrets' });
      }
      return env;
    }),

  create: orgProcedure
    .input(z.object({
      projectSlug: z.string(),
      name: z.string().min(1).max(100),
      slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
      targetType: targetTypeEnum,
      config: environmentConfigSchema.optional(),
      secrets: environmentSecretsSchema.optional(),
      isDefault: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'MEMBER')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Member role required' });
      }

      const project = await ctx.db.project.findUnique({
        where: { orgId_slug: { orgId: ctx.org.id, slug: input.projectSlug } },
      });
      if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });

      // If setting as default, unset other defaults
      if (input.isDefault) {
        await ctx.db.testEnvironment.updateMany({
          where: { projectId: project.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return ctx.db.testEnvironment.create({
        data: {
          projectId: project.id,
          name: input.name,
          slug: input.slug ?? slugify(input.name),
          targetType: input.targetType,
          config: input.config as any ?? undefined,
          secrets: input.secrets as any ?? undefined,
          isDefault: input.isDefault,
        },
      });
    }),

  setDefault: orgProcedure
    .input(z.object({ projectSlug: z.string(), envId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'MEMBER')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Member role required' });
      }

      const project = await ctx.db.project.findUnique({
        where: { orgId_slug: { orgId: ctx.org.id, slug: input.projectSlug } },
      });
      if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });

      await ctx.db.testEnvironment.updateMany({
        where: { projectId: project.id, isDefault: true },
        data: { isDefault: false },
      });

      return ctx.db.testEnvironment.update({
        where: { id: input.envId },
        data: { isDefault: true },
      });
    }),

  delete: orgProcedure
    .input(z.object({ envId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'ADMIN')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin role required to delete environments' });
      }

      await ctx.db.testEnvironment.delete({ where: { id: input.envId } });
      return { success: true };
    }),
});
