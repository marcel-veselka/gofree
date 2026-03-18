import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { t, protectedProcedure, orgProcedure } from '../procedures';
import { slugify } from '@gofree/core';

export const orgRouter = t.router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await ctx.db.orgMembership.findMany({
      where: { userId: ctx.user.id },
      include: { org: true },
      orderBy: { org: { name: 'asc' } },
    });
    return memberships.map((m) => ({ ...m.org, role: m.role }));
  }),

  getBySlug: orgProcedure.query(async ({ ctx }) => {
    return { ...ctx.org, role: ctx.orgRole };
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const slug = input.slug ?? slugify(input.name);

      const existing = await ctx.db.organization.findUnique({ where: { slug } });
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Organization slug already exists' });
      }

      const org = await ctx.db.organization.create({
        data: {
          name: input.name,
          slug,
          members: {
            create: {
              userId: ctx.user.id,
              role: 'OWNER',
            },
          },
        },
        include: { members: true },
      });
      return org;
    }),
});
