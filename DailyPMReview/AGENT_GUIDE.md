# AGENT_GUIDE.md — Zata PM File API

This document is the primary reference for any AI agent that needs to read or write
PM HTML files on behalf of AgencyOS clients. Load it at the start of every session.

---

## Authentication

All agent endpoints use a static machine-to-machine token.

```
Authorization: Bearer <VIDEO_API_TOKEN>
```

The token is the same `VIDEO_API_TOKENS` value configured in the Zata backend `.env`.

**Important — token format:** The `.env` entry looks like:
```
VIDEO_API_TOKENS=56737486736868655375835:read+write
```
Use **only the numeric part before the colon** as the Bearer value:
```
Authorization: Bearer 56737486736868655375835
```
Do **not** include `:read+write` in the header — it will cause a `401 Invalid API token` error.

---

## Base URL

```
https://video.celiyo.com/api
```



---

## Endpoints

### 1. Workspace Map

```
GET /agent/workspace-map
```

Returns all active client workspaces with their PM folder IDs and file counts.
**Call this first** to discover workspace IDs and PM folder IDs.

**Response**
```json
{
  "workspaces": [
    {
      "workspace_id": "uuid",
      "client_name": "Acme Corp",
      "bucket": "acme-corp",
      "client_page_url": "https://...",   // current featured HTML page (may be null)
      "pm_folder_id": "uuid",
      "file_count": 3
    }
  ]
}
```

---

### 2. List PM Files for a Workspace

```
GET /agent/workspace/:workspace_id/pm-files
```

Lists all HTML files currently in the PM folder for a workspace.

**Response**
```json
{
  "folder_id": "uuid",
  "files": [
    {
      "id": "uuid",
      "name": "2025-05_project-overview.html",
      "url": "https://... (presigned, 1hr)",
      "created_at": "2025-05-24T...",
      "size": 14200
    }
  ]
}
```

---

### 3. Read HTML Content of a PM File

```
GET /agent/workspace/:workspace_id/pm/:file_id
```

Returns the raw HTML content of a specific file.

**Response**
- `Content-Type: text/html; charset=utf-8`
- `X-File-Name: <filename>` header
- Body: raw HTML string

---

### 4. Upload / Replace a PM File

```
POST /agent/workspace/:workspace_id/pm-upload
Content-Type: application/json
```

**Request Body**
```json
{
  "filename": "2025-05_project-overview.html",
  "html": "<!DOCTYPE html>...",
  "replace": true
}
```

- `filename` — required, must end in `.html`. Use the naming convention below.
- `html` — required, full HTML string.
- `replace` — optional boolean. When `true`, the existing file with the same filename
  is soft-deleted and a new version is created. Default: `false` (creates a second copy).

**Response**
```json
{
  "success": true,
  "file_id": "uuid",
  "filename": "2025-05_project-overview.html",
  "object_key": "workspaces/acme-corp/pm/uuid/2025-05_project-overview.html",
  "workspace_id": "uuid",
  "folder_id": "uuid",
  "client_page_url": "https://... (presigned, 7 days)",
  "created_at": "2025-05-24T..."
}
```

After a successful upload, `client_page_url` on the workspace is automatically updated
to a 7-day presigned URL pointing to the newly uploaded file.

---

## File Naming Convention

```
YYYY-MM_slug.html
```

Examples:
- `2025-05_project-overview.html`
- `2025-05_q2-strategy.html`
- `2025-06_onboarding-roadmap.html`

Rules:
- Always prefix with the current year-month (`YYYY-MM`).
- Use lowercase kebab-case for the slug — no spaces, no uppercase.
- One file per purpose per month. Use `replace: true` to update in-place.

---

## Typical Agent Workflow

```
1. GET /agent/workspace-map
   → find the workspace_id for the client you're working on

2. GET /agent/workspace/:id/pm-files
   → see what files already exist; note the file_id if you need to read one

3. (Optional) GET /agent/workspace/:id/pm/:fileId
   → read back an existing file's HTML before deciding to update it

4. POST /agent/workspace/:id/pm-upload
   → body: { filename, html, replace: true }
   → on success, the new client_page_url is returned
```

---

## HTML Design System

All PM HTML files must follow the design system documented in:

```
/AIOS/PM_DESIGN_GUIDE.md
```

Key points:
- Dark theme matching the AgencyOS app (`#0a0a0f` background, `#6366f1` accent)
- Self-contained single-file HTML (all CSS inline in `<style>`)
- No external dependencies / no CDN links
- Use the six component types: section-header, timeline, status-grid, task-list,
  strategy-block, links-block
- Mobile-responsive with a `max-width: 960px` centered container

---

## Static Workspace Snapshot

For quick reference without a live API call, a static snapshot of all workspace IDs
and PM folder IDs is kept at:

```
/AIOS/WORKSPACE_SNAPSHOT.md
```

**Important:** this file is a point-in-time snapshot. Always call `/agent/workspace-map`
first to get current data; use the snapshot only as a fallback or for bootstrapping.

---

## Error Reference

| Status | Meaning |
|--------|---------|
| 401 | Missing or invalid `VIDEO_API_TOKEN` |
| 403 | Token lacks the required scope (`read` or `write`) |
| 400 | Missing `filename` or `html`, or filename doesn't end in `.html` |
| 404 | Workspace or PM folder not found |
| 500 | Storage or database error — check Zata server logs |
