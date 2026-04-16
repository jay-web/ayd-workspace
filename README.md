# AYD Workspace

AYD Workspace is a production-style **multi-tenant AI workspace SaaS** being built to learn, design, and implement a real-world document intelligence platform.

The project is not just a demo app. It is being developed as a **commercial-grade system design + engineering journey** focused on modern frontend architecture, backend/API design, AWS serverless infrastructure, document ingestion, and retrieval-augmented generation (RAG).

---

## Goal

Build a workspace-first AI SaaS where users can:

- sign in securely
- create and manage workspaces
- upload documents
- process PDFs through an ingestion pipeline
- extract and structure document content
- ask questions against uploaded documents
- receive AI-generated answers grounded in retrieved context

---

## Core Product Vision

AYD Workspace is designed as a **document-centric AI application** with:

- workspace-based isolation
- secure authentication
- document upload and storage
- async ingestion pipeline
- text extraction + chunking + embeddings
- retrieval pipeline for grounded answers
- pluggable multi-model AI architecture

---

## Current Architecture Direction

### Frontend / App Layer
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Workspace-first UI architecture
- Route handlers used as the application backend layer

### Authentication
- Amazon Cognito
- Authorization Code Flow with PKCE
- Custom integration
- No Amplify

### Core Backend Pattern
- Next.js route handlers for app/backend APIs
- PostgreSQL as system of record
- AWS serverless services for async document ingestion

### Data & Storage
- Amazon S3 for raw document storage
- PostgreSQL (RDS) for relational application data
- pgvector in PostgreSQL for vector storage
- PostgreSQL document metadata + chunk persistence

### Async Ingestion Pipeline
- S3 upload
- S3 event notification
- Amazon SQS queue
- Python Lambda ingestion worker
- PyMuPDF for digital PDF text extraction
- Amazon Textract async fallback planned for scanned/image PDFs

### AI / RAG
- Custom RAG pipeline
- Grounded retrieval approach
- Amazon Bedrock for model access
- Multi-model architecture planned:
  - Claude via Bedrock
  - OpenAI via direct API
- Shared retrieval/orchestration layer with swappable generation providers

---

## High-Level System Flow

### Workspace and App Flow
1. User signs in with Cognito PKCE flow
2. User creates or enters a workspace
3. User uploads a document
4. App stores metadata in PostgreSQL
5. File is uploaded to S3
6. Ingestion pipeline processes the file asynchronously
7. Extracted content is chunked and stored
8. User queries documents through chat/Q&A flow
9. Retrieved chunks are used to ground AI answers

### Ingestion Flow
1. PDF is uploaded to S3
2. S3 sends object-created notification to SQS
3. Lambda ingestion worker consumes the SQS message
4. Worker downloads file from S3
5. Worker extracts text from PDF
6. Next planned stages:
   - chunking
   - embeddings
   - vector storage
   - retrieval integration

---

## Current Tech Stack

## Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

## Auth
- Amazon Cognito
- PKCE Authorization Code Flow
- Cookie/session-based app auth integration

## Backend / APIs
- Next.js Route Handlers
- AWS SAM
- AWS Lambda (Python container workers for ingestion path)

## Database
- PostgreSQL
- pgvector

## Storage / Messaging
- Amazon S3
- Amazon SQS

## AI
- Amazon Bedrock
- Custom RAG pipeline
- Multi-model-ready architecture

---

## Current Progress

### Completed
- Cognito PKCE auth flow
- Login / callback / token exchange / session handling
- Workspace-first app structure
- Workspace CRUD flow
- PostgreSQL migration-based relational schema
- Workspace and membership persistence
- Document metadata schema
- Document chunk schema with pgvector-ready design
- S3 upload flow
- AWS SAM infra for ingestion path
- S3 -> SQS -> Lambda event-driven ingestion pipeline
- Python ingestion worker
- S3 file download inside worker
- PDF text extraction using PyMuPDF
- Structured logging in ingestion worker











