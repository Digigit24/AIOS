# AgencyOS Composio Agent Guide

Use this guide when an AI agent needs read-only client data from Composio-connected accounts.

AgencyOS is not the system of record for client strategy or structured client details. Notion remains the structured client source. AgencyOS stores only workspace execution data, PM HTML reports, post tables, and lightweight Composio connection metadata.

## Rules

- Read-only only.
- Do not publish, schedule, delete, edit external accounts, change permissions, or mutate campaigns.
- Do not store raw platform exports in AgencyOS.
- Write back only summaries, selected resource IDs, connection health, and PM HTML reports.
- Use Notion for durable structured client context.

## Authentication

AgencyOS agent endpoints use the Zata `VIDEO_API_TOKEN`.

```txt
Authorization: Bearer <VIDEO_API_TOKEN>
```

Use only the token value before any `:read+write` suffix.

## Discover Client Workspaces

```http
GET /api/agent/workspace-map
Authorization: Bearer <VIDEO_API_TOKEN>
```

Find the target client by `client_name` and note `workspace_id`.

## Get Composio Context

```http
GET /api/agent/workspace/:workspace_id/composio-context
Authorization: Bearer <VIDEO_API_TOKEN>
```

Response shape:

```json
{
  "workspace": {
    "id": "uuid",
    "client_name": "Client Name"
  },
  "composio": {
    "user_id": "agencyos_workspace_uuid",
    "mode": "read_only",
    "connected_accounts": [
      {
        "toolkit": "google_search_console",
        "label": "Client Google Search Console",
        "connected_account_id": "ca_xxx",
        "auth_config_id": "ac_xxx",
        "selected_resource": {},
        "latest_summary": {},
        "read_only_use": "Search properties, queries, pages, clicks, impressions, CTR, and position."
      }
    ]
  }
}
```

## Using Composio

Install and configure Composio wherever the AI agent runs. The current Node SDK package is:

```bash
npm install @composio/core
```

Use the returned `composio.user_id` and `connected_account_id` to scope tool execution to the client workspace.

The available MVP toolkits are:

```txt
google_search_console
facebook
instagram
linkedin
youtube
twitter
google_ads
```

Only use read-only tools/actions from those toolkits. Google Ads is currently connection-only in AgencyOS until a confirmed Composio account/campaign listing tool is configured.

Client asset mapping is available for:

```txt
google_search_console -> selected GSC property
facebook -> selected Facebook page
linkedin -> selected company page
youtube -> authenticated channel
twitter -> authenticated account
```

## Store a Summary Back in AgencyOS

After reading data through Composio, store a compact summary:

```http
PATCH /api/agent/workspace/:workspace_id/integrations/:toolkit/summary
Authorization: Bearer <VIDEO_API_TOKEN>
Content-Type: application/json

{
  "status": "ACTIVE",
  "selected_resource": {
    "property": "sc-domain:example.com"
  },
  "latest_summary": {
    "period": "last_28_days",
    "clicks": 1234,
    "impressions": 45678,
    "top_queries": ["query one", "query two"],
    "notes": "Traffic improved after service page updates."
  }
}
```

Keep this summary small. It is for dashboard visibility and PM reporting, not raw data archival.

## PM Report Flow

1. `GET /api/agent/workspace-map`
2. `GET /api/agent/workspace/:workspace_id/composio-context`
3. Read client context from Notion MCP.
4. Read platform data through Composio with the returned connected accounts.
5. Generate PM HTML using `PM_DESIGN_GUIDE.md`.
6. Upload the report:

```http
POST /api/agent/workspace/:workspace_id/pm-upload
Authorization: Bearer <VIDEO_API_TOKEN>
Content-Type: application/json

{
  "filename": "YYYY-MM_composio-review.html",
  "html": "<!DOCTYPE html>...",
  "replace": true
}
```

## Forbidden Actions

- Publishing posts.
- Creating or editing campaigns.
- Changing connected account permissions.
- Deleting connected accounts.
- Bulk exporting raw rows into AgencyOS.
- Updating Notion fields except when the user explicitly asks.
