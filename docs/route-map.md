# Route Map

This document describes the current route structure of the AYD Workspace SaaS application.

## Public Routes

- `/`  
  Landing page for product introduction and entry point.

- `/login`  
  Authentication entry page.

---

## App Routes

These routes are part of the authenticated application experience.

### Top-Level App Routes

- `/dashboard`  
  Global dashboard entry.

- `/documents`  
  Global documents view.

- `/chat`  
  Global chat experience.

- `/workspaces`  
  List all workspaces available to the signed-in user.

---

## Workspace-Scoped Routes

These routes are scoped to a specific workspace.

- `/workspaces/[workspaceId]`  
  Workspace dashboard / overview page.

- `/workspaces/[workspaceId]/documents`  
  Documents belonging to a workspace.

- `/workspaces/[workspaceId]/chat`  
  Chat experience scoped to a workspace.

---

## API Routes

### Auth API

- `/api/auth/login`  
  Starts authentication flow.

- `/api/auth/callback`  
  Handles auth callback and session creation.

- `/api/auth/logout`  
  Clears session and logs user out.

- `/api/auth/me`  
  Returns current authenticated user/session info.

- `/api/auth/refresh`  
  Refreshes auth session when needed.

### Application API

- `/api/v1/db-test`  
  Database connectivity test route.

- `/api/v1/workspaces`  
  Workspace collection route:
  - `GET` → list workspaces
  - `POST` → create workspace

- `/api/v1/workspaces/[workspaceId]`  
  Workspace item route:
  - `GET` → fetch workspace details

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

- The application follows a **workspace-first architecture**.
- Feature pages are implemented using **Next.js App Router**.
- API routes are colocated under `src/app/api`.
- UI and domain logic are organized into feature modules under `src/modules`.