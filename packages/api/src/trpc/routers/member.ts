import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { t, orgProcedure } from '../procedures';
import { checkPermission } from '@gofree/auth';

export const memberRouter = t.router({
  list: orgProcedure.query(async ({ ctx }) => {
    const members = await ctx.db.orgMembership.findMany({
      where: { orgId: ctx.org.id },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      createdAt: m.createdAt,
      user: m.user,
    }));
  }),

  add: orgProcedure
    .input(z.object({ email: z.string().email(), role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER') }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'ADMIN')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin role required' });
      }

      const user = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found. They must sign up first.' });
      }

      const existing = await ctx.db.orgMembership.findUnique({
        where: { userId_orgId: { userId: user.id, orgId: ctx.org.id } },
      });
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'User is already a member' });
      }

      const membership = await ctx.db.orgMembership.create({
        data: { userId: user.id, orgId: ctx.org.id, role: input.role },
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      });
      return membership;
    }),

  updateRole: orgProcedure
    .input(z.object({ membershipId: z.string(), role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']) }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'ADMIN')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin role required' });
      }

      const membership = await ctx.db.orgMembership.findUnique({
        where: { id: input.membershipId },
      });
      if (!membership || membership.orgId !== ctx.org.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Membership not found' });
      }

      const updated = await ctx.db.orgMembership.update({
        where: { id: input.membershipId },
        data: { role: input.role },
      });
      return updated;
    }),

  remove: orgProcedure
    .input(z.object({ membershipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'ADMIN')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin role required' });
      }

      const membership = await ctx.db.orgMembership.findUnique({
        where: { id: input.membershipId },
      });
      if (!membership || membership.orgId !== ctx.org.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Membership not found' });
      }

      // Prevent removing the last OWNER
      if (membership.role === 'OWNER') {
        const ownerCount = await ctx.db.orgMembership.count({
          where: { orgId: ctx.org.id, role: 'OWNER' },
        });
        if (ownerCount <= 1) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot remove the last owner' });
        }
      }

      await ctx.db.orgMembership.delete({ where: { id: input.membershipId } });
      return { success: true };
    }),
});
