import type { OrgRole } from '@gofree/core';

const roleHierarchy: Record<OrgRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

export function checkPermission(userRole: OrgRole, requiredRole: OrgRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
