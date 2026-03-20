-- pgvector embedding column for semantic test case search
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE INDEX IF NOT EXISTS test_cases_embedding_idx
  ON test_cases USING hnsw (embedding vector_cosine_ops);
