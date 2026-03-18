import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import type { TRPCContext } from '../context';

const t = initTRPC.context<TRPCContext>().create();

export const projectRouter = t.router({
  list: t.procedure
    .input(z.object({ orgId: z.string() }))
    .query(async ({ ctx, input }) => {
      const projects = await ctx.db.project.findMany({
        where: { orgId: input.orgId },
        orderBy: { name: 'asc' },
      });
      return projects;
    }),

  getBySlug: t.procedure
    .input(z.object({ orgId: z.string(), slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { orgId_slug: { orgId: input.orgId, slug: input.slug } },
      });
      return project;
    }),

  create: t.procedure
    .input(
      z.object({
        orgId: z.string(),
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: input,
      });
      return project;
    }),
});
