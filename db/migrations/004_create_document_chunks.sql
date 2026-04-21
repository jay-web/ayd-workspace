CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS document_chunks (
  chunk_id UUID PRIMARY KEY,
  document_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
  content TEXT NOT NULL,
  embedding vector(1024) NOT NULL,
  page_start INTEGER NULL CHECK (page_start >= 1),
  page_end INTEGER NULL CHECK (page_end >= 1),
  token_count INTEGER NULL CHECK (token_count >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_document_chunks_document
    FOREIGN KEY (document_id)
    REFERENCES documents(document_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_document_chunks_workspace
    FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id)
    ON DELETE CASCADE,

  CONSTRAINT uq_document_chunks_document_index
    UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id
  ON document_chunks(document_id);

CREATE INDEX IF NOT EXISTS idx_document_chunks_workspace_id
  ON document_chunks(workspace_id);