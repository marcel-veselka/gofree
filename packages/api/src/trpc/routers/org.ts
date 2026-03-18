import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import type { TRPCContext } from '../context.js';

const t = initTRPC.context<TRPCContext>().create();

export const orgRouter = t.router({
  list: t.procedure.query(async ({ ctx }) => {
    // TODO: Filter by current user's memberships
    const orgs = await ctx.db.organization.findMany({
      take: 50,
      orderBy: { name: 'asc' },
    });
    return orgs;
  }),

  getBySlug: t.procedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const org = await ctx.db.organization.findUnique({
        where: { slug: input.slug },
      });
      return org;
    }),

  create: t.procedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.organization.create({
        data: {
          name: input.name,
          slug: input.slug,
        },
      });
      return org;
    }),
});
