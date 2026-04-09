CREATE TABLE IF NOT EXISTS documents (
  document_id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  original_file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  storage_key TEXT NOT NULL UNIQUE,
  uploaded_by TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('UPLOADING', 'PROCESSING', 'READY', 'FAILED')),
  error_message TEXT NULL,
  ingested_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_documents_workspace
    FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_documents_workspace_id
  ON documents(workspace_id);

CREATE INDEX IF NOT EXISTS idx_documents_workspace_created_at
  ON documents(workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_status
  ON documents(status);