import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import superjson from 'superjson';
import type { TRPCContext } from './context';

export const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

// Public — no auth required
export const publicProcedure = t.procedure;

// Protected — requires valid session
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

// Org-scoped — requires session + org membership
export const orgProcedure = protectedProcedure
  .input(z.object({ orgSlug: z.string() }))
  .use(async ({ ctx, input, next }) => {
    const membership = await ctx.db.orgMembership.findFirst({
      where: {
        userId: ctx.user.id,
        org: { slug: input.orgSlug },
      },
      include: { org: true },
    });

    if (!membership) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
    }

    return next({
      ctx: {
        ...ctx,
        org: membership.org,
        membership,
        orgRole: membership.role,
      },
    });
  });
