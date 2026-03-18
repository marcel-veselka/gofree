import { db } from '@gofree/db';
import { NotFoundError, ForbiddenError } from '@gofree/core';

export async function resolveOrg(userId: string, orgSlug: string) {
  const membership = await db.orgMembership.findFirst({
    where: {
      userId,
      org: { slug: orgSlug },
    },
    include: { org: true },
  });

  if (!membership) {
    throw new NotFoundError('Organization', orgSlug);
  }

  return { org: membership.org, role: membership.role, membership };
}

export async function resolveProject(orgId: string, projectSlug: string) {
  const project = await db.project.findUnique({
    where: { orgId_slug: { orgId, slug: projectSlug } },
  });

  if (!project) {
    throw new NotFoundError('Project', projectSlug);
  }

  return project;
}
