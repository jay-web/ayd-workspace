#!/usr/bin/env bash

set -e

psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f db/migrations/001_create_workspaces.sql
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f db/migrations/002_create_workspace_memberships.sql
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f db/migrations/003_create_documents.sql
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f db/migrations/004_create_document_chunks.sql
