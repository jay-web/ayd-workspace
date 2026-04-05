# High-Level Architecture

AYD Workspace SaaS is a workspace-first document and chat application built with Next.js App Router.  
The current architecture focuses on a clean modular application structure, server-side APIs, PostgreSQL-backed metadata storage, and a future-ready document ingestion + RAG pipeline.

---

## Current Architecture Diagram

```mermaid
flowchart TD

    A[User / Browser] --> B[Next.js App Router UI]

    B --> C[Auth Routes]
    B --> D[API Routes /api/v1/...]
    B --> E[Workspace Pages]
    B --> F[Document Pages]

    C --> G[Cognito PKCE Authentication]

    D --> H[Route Handlers]
    H --> I[Module Repositories]
    I --> J[(PostgreSQL / RDS)]

    H --> K[Shared Lib Layer]
    K --> L[Auth Utilities]
    K --> M[DB Utilities]
```

# Planned Product Architecture
```mermaid
flowchart TD

    A[User / Browser] --> B[Next.js Frontend]

    B --> C[Cognito Authentication]
    B --> D[Next.js API Routes]

    D --> E[Application Logic / Modules]

    E --> F[(PostgreSQL / RDS)]
    E --> G[S3 - Document Storage]
    E --> H[Document Ingestion Pipeline]
    E --> I[Vector / Retrieval Layer]
    E --> J[Bedrock - LLM & Embeddings]

    G --> H
    H --> I
    I --> E
    J --> E
```

Architecture Layers
1. Frontend Layer
Built with Next.js App Router
UI pages live under src/app
Reusable UI components live under src/components
Feature-specific UI lives under src/modules
2. Authentication Layer
Uses Amazon Cognito with PKCE
Session handling is managed through auth routes and shared auth utilities
3. API Layer
Implemented using Next.js route handlers
Routes live under src/app/api
Responsible for request validation, auth checks, and orchestration
4. Domain / Module Layer
Business logic is organized by feature
Example:
src/modules/workspace
future src/modules/documents
5. Data Layer
PostgreSQL / RDS stores relational application data such as:
workspaces
memberships
documents metadata
future application records
6. Document Storage Layer
S3 stores uploaded files
Database stores file metadata, ownership, and processing state
7. AI / Retrieval Layer
Planned RAG pipeline will include:
document ingestion
chunking
embeddings
retrieval
grounded chat responses
8. LLM Layer
Amazon Bedrock will power generation and embeddings in the AI workflow
