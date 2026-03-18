import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { t, orgProcedure } from '../procedures';
import { checkPermission } from '@gofree/auth';
import { slugify } from '@gofree/core';

export const projectRouter = t.router({
  list: orgProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: { orgId: ctx.org.id },
      orderBy: { name: 'asc' },
    });
    return projects;
  }),

  getBySlug: orgProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { orgId_slug: { orgId: ctx.org.id, slug: input.slug } },
      });
      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }
      return project;
    }),

  create: orgProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'MEMBER')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Member role required to create projects' });
      }

      const slug = input.slug ?? slugify(input.name);
      const project = await ctx.db.project.create({
        data: {
          orgId: ctx.org.id,
          name: input.name,
          slug,
          description: input.description,
        },
      });
      return project;
    }),

  delete: orgProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'ADMIN')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin role required to delete projects' });
      }

      const project = await ctx.db.project.findUnique({ where: { id: input.projectId } });
      if (!project || project.orgId !== ctx.org.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }

      await ctx.db.project.delete({ where: { id: input.projectId } });
      return { success: true };
    }),
});
