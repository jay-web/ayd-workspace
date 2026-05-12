# Route Map

This document describes the current route structure of the AYD Workspace SaaS application.

AYD uses Next.js App Router with a workspace-first structure. Public routes handle landing/authentication, authenticated app routes handle dashboard and workspace screens, and API routes live under `src/app/api`.

---

## Public Routes

- `/`  
  Landing page for product introduction and entry point.

- `/login`  
  Authentication entry page.

---

## Authenticated App Routes

These routes are part of the signed-in application experience and live under the authenticated app layout.

### Top-Level App Routes

- `/dashboard`  
  Main dashboard entry for the signed-in user.

- `/workspaces`  
  Lists all workspaces available to the signed-in user.

---

## Workspace-Scoped Routes

These routes are scoped to a specific workspace.

- `/workspaces/[workspaceId]`  
  Workspace dashboard / overview page.

- `/workspaces/[workspaceId]/documents`  
  Workspace document experience. This is the main document page where users can upload PDFs, view document status, select documents, ask questions, view citations, and open source PDF references.

---

## Removed / Deprecated App Routes

The older global document/chat route idea is no longer part of the main Phase 1 architecture.

- `/documents`  
  Deprecated as a main product route. Documents are now workspace-scoped.

- `/chat`  
  Deprecated as a global route. Chat is now document-scoped inside a workspace document page.

- `/workspaces/[workspaceId]/chat`  
  Deprecated as a separate route. Chat is now part of `/workspaces/[workspaceId]/documents` and is tied to the selected document.

---

## API Routes

### Auth API

- `/api/auth/login`  
  Starts the Cognito authentication flow.

- `/api/auth/callback`  
  Handles the Cognito auth callback and session creation.

- `/api/auth/logout`  
  Clears session and logs the user out.

### Versioned Application API

- `/api/v1/auth/me`  
  Returns the current authenticated user and upserts/loads user information used by the app.

- `/api/v1/workspaces`  
  Workspace collection route:
  - `GET` → list workspaces available to the signed-in user
  - `POST` → create workspace

- `/api/v1/workspaces/[workspaceId]`  
  Workspace item route:
  - `GET` → fetch workspace details

- `/api/v1/workspaces/[workspaceId]/members`  
  Workspace member management route:
  - `GET` → list workspace members
  - `POST` → add a workspace member by email and role

- `/api/v1/workspaces/[workspaceId]/documents`  
  Workspace documents collection route:
  - `GET` → list documents for the workspace
  - `POST` → create document metadata and return a presigned S3 upload URL

- `/api/v1/workspaces/[workspaceId]/documents/[documentId]`  
  Workspace document item route:
  - `DELETE` → delete document file, chunks, vectors, chat messages, and metadata

- `/api/v1/workspaces/[workspaceId]/documents/[documentId]/chat`  
  Document-grounded chat route:
  - `POST` → ask a question against the selected document and return an answer with citations

- `/api/v1/workspaces/[workspaceId]/documents/[documentId]/chat/messages`  
  Document-scoped chat history route:
  - `GET` → load saved chat messages for the selected document
  - `POST` → save a `USER` or `ASSISTANT` chat message for the selected document

---

## Main Route Flow

```txt
Login
→ Workspaces
→ Workspace Dashboard
→ Workspace Documents
→ Select Document
→ Ask Document Questions
→ View Citations / Open PDF Source
```

---

## Layouts

- `src/app/layout.tsx`  
  Root application layout.

- `src/app/(app)/layout.tsx`  
  Shared authenticated app layout.

- `src/app/(app)/workspaces/[workspaceId]/layout.tsx`  
  Workspace-scoped layout with workspace navigation/sidebar.

---

## Notes

- The application follows a workspace-first architecture.
- Documents are scoped to workspaces.
- Chat is scoped to the selected workspace document.
- Chat history is stored per `workspaceId + documentId`.
- API routes are implemented with Next.js route handlers.
- API routes use session checks and workspace membership checks.
- Metadata and chat history are stored in DynamoDB.
- Uploaded files are stored in S3.
- Document ingestion is handled asynchronously through SQS and Lambda.
- Vector retrieval uses S3 Vectors.
- UI and domain logic are organized into feature modules under `src/modules`.
