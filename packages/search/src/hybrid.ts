import { searchKeyword } from './keyword';
import { searchVector } from './vector';

interface HybridSearchOptions {
  query: string;
  orgId: string;
  projectId?: string;
  limit?: number;
}

/**
 * Combines keyword and vector search results using Reciprocal Rank Fusion (RRF).
 */
export async function searchHybrid(options: HybridSearchOptions) {
  const [keywordResults, vectorResults] = await Promise.all([
    searchKeyword(options),
    searchVector(options),
  ]);

  // TODO: Implement RRF ranking to merge results
  // For now, return keyword results
  return keywordResults;
}
