# ADT Architecture

ADT follows the Project Framework Agent First principle: design for a human reader and an external AI agent at the same time.

## Human Interface

| Area | Current Implementation |
| --- | --- |
| Page | Public roofing/construction contractor card. |
| Trust Signals | Formal IP identifiers, service scope, photos, caution boundaries. |
| Actions | UI buttons for controlled agent-style actions. |
| Safety Copy | Explicit limits around price, visit date, warranty, photo provenance, object addresses, and crew availability. |

## Agent Interface

| Area | Current Implementation |
| --- | --- |
| Canonical contract | `/agent.json` |
| Discovery aliases | `/.well-known/agent.json`, `/llms.txt`, `/.well-known/llms.txt`, `/openapi.json`, `/.well-known/openapi.json` |
| Crawl hints | `/robots.txt`, `/sitemap.xml` |
| Action API | `/api/agent-actions` |
| Status API | `/api/agent-actions?requestId=<exact_request_id>` |
| Safety boundary | Full logs are not public; status requires exact unpredictable request ID. |

## Data and Runtime

- Sites/Worker runtime.
- D1-style server storage through Drizzle schema/migration.
- Event/request log for controlled agent actions.
- No public contact or private object data in status responses.

## Architecture Questions

- Should ADT later expose a fuller MCP/action interface, or is OpenAPI enough for the current research stage?
- What proof assets should become structured data instead of page copy?
- Which parts of contractor verification should be machine-readable?
