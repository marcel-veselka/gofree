interface VectorSearchOptions {
  query: string;
  orgId: string;
  projectId?: string;
  limit?: number;
}

export async function searchVector(_options: VectorSearchOptions) {
  // TODO: Implement pgvector nearest-neighbor search
  // 1. Generate embedding for query using AI provider
  // 2. Run cosine similarity search via raw SQL
  return [];
}
