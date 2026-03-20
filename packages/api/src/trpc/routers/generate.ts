import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { t, orgProcedure } from '../procedures';
import { checkPermission } from '@gofree/auth';

export const generateRouter = t.router({
  fromUrl: orgProcedure
    .input(z.object({
      projectSlug: z.string(),
      url: z.string().url(),
      targetType: z.enum(['WEB', 'API']).default('WEB'),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!checkPermission(ctx.orgRole, 'MEMBER')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Member role required' });
      }

      const project = await ctx.db.project.findUnique({
        where: { orgId_slug: { orgId: ctx.org.id, slug: input.projectSlug } },
      });
      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }

      // Fire and forget — run generation in background
      const { generateTests } = await import('@gofree/ai');
      generateTests({
        url: input.url,
        projectId: project.id,
        orgSlug: input.orgSlug,
        targetType: input.targetType,
      }).catch((err) => {
        console.error(`[generate.fromUrl] Failed for ${input.url}:`, err);
      });

      return {
        status: 'generating' as const,
        message: 'AI is analyzing your application...',
      };
    }),
});
