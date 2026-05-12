# AYD Workspace

AYD Workspace is a production-style **multi-tenant AI workspace SaaS** built to design and implement a real-world document intelligence platform.

It is being developed as a **commercial-grade system design + engineering journey** focused on modern frontend architecture, backend/API design, AWS serverless infrastructure, document ingestion, vector retrieval, and document-grounded AI chat.

---

## Goal

Build a workspace-first AI SaaS where users can:

- sign in securely
- create and manage workspaces
- invite workspace members
- upload documents
- process PDFs through an async ingestion pipeline
- extract and chunk document content
- store document vectors
- ask questions against uploaded documents
- receive grounded answers with citations
- maintain separate chat history per document

---

## Core Product Vision

AYD Workspace is designed as a **document-centric AI application** with:

- workspace-based isolation
- secure authentication
- document upload and storage
- async ingestion pipeline
- PDF text extraction
- document chunking
- vector storage and retrieval
- grounded chat responses
- citation-backed answers
- document-scoped chat history
- AWS-native backend architecture

---

## Current Architecture

### Frontend / App Layer

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Workspace-first UI architecture
- Mobile-responsive document chat UI
- Route handlers used as the application backend layer

### Authentication

- Amazon Cognito
- Authorization Code Flow with PKCE
- Cookie/session-based app integration
- Custom auth integration
- No Amplify

### Backend / API Pattern

- Next.js route handlers for app/backend APIs
- Server-side session checks
- Workspace membership checks
- Feature-based module/repository structure
- DynamoDB-backed metadata persistence

### Data & Storage

- Amazon DynamoDB for application metadata
- Amazon S3 for raw document storage
- Amazon S3 Vectors for vector storage and retrieval

DynamoDB currently stores:

- users
- workspaces
- workspace members
- documents
- document chunks
- document-scoped chat messages

### Async Ingestion Pipeline

- S3 document upload
- SQS ingestion queue
- Python Lambda ingestion worker
- PyMuPDF for digital PDF text extraction
- document chunking
- chunk metadata stored in DynamoDB
- vectors stored in S3 Vectors
- document status updates in DynamoDB

### AI / RAG

- Custom document-grounded chat flow
- Retrieval using stored document vectors/chunks
- Citation/source-backed answers
- Multi-model architecture planned for future phases
- Bedrock integration planned for future phases

---

## High-Level System Flow

### Workspace and App Flow

1. User signs in with Cognito PKCE flow.
2. App creates/loads user profile data.
3. User creates or enters a workspace.
4. User can add workspace members by email.
5. User uploads a document.
6. App stores document metadata in DynamoDB.
7. Browser uploads file to S3 using a presigned URL.
8. Ingestion pipeline processes the file asynchronously.
9. Extracted content is chunked and stored.
10. Vectors are stored in S3 Vectors.
11. User asks questions against a selected document.
12. Retrieved chunks are used to ground answers.
13. Answers are returned with citations.
14. Chat messages are saved per workspace and document.

### Ingestion Flow

1. Document metadata is created in DynamoDB.
2. File is uploaded to S3.
3. Ingestion message is sent to SQS.
4. Lambda ingestion worker consumes the SQS message.
5. Worker downloads the file from S3.
6. Worker extracts text using PyMuPDF.
7. Worker chunks the extracted text.
8. Worker stores chunk metadata in DynamoDB.
9. Worker stores vectors in S3 Vectors.
10. Worker updates document status to `READY`.

### Document Chat Flow

1. User selects a document.
2. App loads saved chat history for that document.
3. User asks a question.
4. User message is saved to DynamoDB.
5. Chat API retrieves relevant document context.
6. Assistant answer is generated from retrieved context.
7. Answer and citations are rendered in the UI.
8. Assistant message is saved to DynamoDB.
9. Switching documents loads that document's own chat history.

---

## Current Tech Stack

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS

### Auth

- Amazon Cognito
- PKCE Authorization Code Flow
- Cookie/session-based app auth integration

### Backend / APIs

- Next.js Route Handlers
- AWS SAM
- AWS Lambda
- Python ingestion worker

### Database / Metadata

- Amazon DynamoDB

### Storage / Messaging / Retrieval

- Amazon S3
- Amazon SQS
- Amazon S3 Vectors

### AI

- Custom document-grounded retrieval flow
- Citation-backed document Q&A
- Multi-model-ready architecture planned

---

## AWS Services Used

- Amazon Cognito
- Amazon S3
- Amazon DynamoDB
- Amazon SQS
- AWS Lambda
- Amazon S3 Vectors
- AWS SAM / CloudFormation

---

## Current DynamoDB Tables

Current development tables include:

```txt
ayd-workspaces-dev
ayd-workspace-members-dev
ayd-users-dev
ayd-documents-dev
ayd-document-chunks-dev
ayd-chat-messages-dev
```

---

## Document-Scoped Chat History

AYD stores chat history per document.

Chat messages are scoped by:

```txt
workspaceId + documentId
```

Chat table key pattern:

```txt
pk = WORKSPACE#<workspaceId>#DOCUMENT#<documentId>
sk = MESSAGE#<createdAt>#<messageId>
```

Allowed message roles:

```txt
USER
ASSISTANT
```

This allows every PDF/document to maintain its own independent chat history.

---

## Document Delete Cleanup

When a document is deleted, AYD cleans up related resources:

```txt
Delete S3 document file
→ Delete document chunks from DynamoDB
→ Delete vectors from S3 Vectors
→ Delete document chat messages from DynamoDB
→ Delete document metadata from DynamoDB
```

This prevents orphan files, chunks, vectors, and chat messages from remaining in the system.

---

## Current Progress

### Completed

- Cognito PKCE auth flow
- Login / callback / token exchange / session handling
- Current authenticated user API
- Workspace-first app structure
- Workspace creation and listing
- Workspace member management
- Add workspace member by email
- DynamoDB users table
- DynamoDB workspace tables
- DynamoDB documents table
- S3 document upload flow
- Presigned upload URL flow
- AWS SAM infrastructure
- SQS ingestion queue
- Ingestion DLQ
- Python Lambda ingestion worker
- S3 file download inside worker
- PDF text extraction using PyMuPDF
- Document chunking
- DynamoDB document chunks table
- S3 Vectors integration
- Document status flow through `UPLOADING`, `PROCESSING`, `READY`, and failure states
- Document-grounded chat flow
- Citation/source panel
- PDF citation opening
- Mobile responsive chat UI
- Selected document mobile UI polish
- DynamoDB chat messages table
- Document-scoped chat history
- Chat messages saved per `workspaceId + documentId`
- Chat history loads when switching documents
- Related chat messages deleted when a document is deleted

---

## Phase 1 Status

AYD Phase 1 is complete.

The app now has a working workspace/document/chat foundation with AWS-backed storage, ingestion, retrieval, citations, mobile-friendly UI, and document-scoped chat persistence.

---


