import { db } from '@gofree/db';

interface KeywordSearchOptions {
  query: string;
  orgId: string;
  projectId?: string;
  limit?: number;
}

export async function searchKeyword(options: KeywordSearchOptions) {
  const { query, orgId, projectId, limit = 25 } = options;

  // TODO: Use raw SQL with ts_rank and ts_query for full-text search
  // For now, use basic LIKE matching
  const results = await db.searchIndex.findMany({
    where: {
      orgId,
      ...(projectId && { projectId }),
      content: { contains: query, mode: 'insensitive' },
    },
    take: limit,
    orderBy: { updatedAt: 'desc' },
  });

  return results;
}
