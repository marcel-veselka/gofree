import crypto from 'crypto';
import { db } from '@gofree/db';
import { NextRequest } from 'next/server';

export interface ApiKeyContext {
  apiKey: {
    id: string;
    name: string;
    orgId: string;
    projectId: string | null;
  };
  orgId: string;
}

/**
 * Validate API key from Authorization: Bearer <token> header.
 * Returns the API key context (org, optional project) or null if invalid.
 */
export async function authenticateApiKey(
  request: NextRequest,
): Promise<ApiKeyContext | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  if (!token) {
    return null;
  }

  const keyHash = crypto.createHash('sha256').update(token).digest('hex');

  const apiKey = await db.apiKey.findUnique({
    where: { keyHash },
    select: {
      id: true,
      name: true,
      orgId: true,
      projectId: true,
      expiresAt: true,
    },
  });

  if (!apiKey) {
    return null;
  }

  // Check expiration
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null;
  }

  // Update lastUsedAt (fire and forget)
  db.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  return {
    apiKey: {
      id: apiKey.id,
      name: apiKey.name,
      orgId: apiKey.orgId,
      projectId: apiKey.projectId,
    },
    orgId: apiKey.orgId,
  };
}
