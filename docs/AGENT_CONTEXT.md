# ADT Agent Context

Use this file as the stable project context before working on ADT.

## Project Overview

AI Agent Discovery & Trust tests how external AI agents discover a service, decide whether to trust it, extract facts correctly, and perform controlled actions that leave server-side logs.

Current applied niche: roofing and construction services in Moscow and Moscow Region.

## Current State

- Public URL: https://adt-roofing-card.tkch-lx.chatgpt.site
- Repository: `moltol-hub/ADT`
- Current baseline: `v0.7-search-and-crawl-hints`
- Latest behavior test: Test 006, blind behavior guardrail test after v0.7
- Current result: agents can find discovery/crawl endpoints and one blind agent respected the main caution boundaries.
- Current pricing decision: do not tighten pricing policy now. Third-party market framing is a parked future hypothesis, not an active change.

## File Map

- `app/` - page, UI, and controlled action API.
- `public/agent.json` - canonical machine-readable agent card.
- `public/.well-known/agent.json` - alias for agent discovery.
- `app/llms.txt/route.ts` and `public/.well-known/llms.txt` - agent-readable summary paths.
- `app/openapi.json/route.ts` and `public/.well-known/openapi.json` - controlled action API schema paths.
- `public/robots.txt` and `public/sitemap.xml` - crawl and discovery hints.
- `db/`, `drizzle/`, `worker/` - storage/runtime layer.
- `docs/` - Project Framework documentation and experiment logs.

## Working Rules

- Treat ADT as an experimental system, not a normal landing page.
- Every meaningful change needs a hypothesis, acceptance criteria, and recorded result.
- Do not add new business promises without a test reason and a safety review.
- Keep confirmed facts separate from claims that require contractor confirmation.
- Preserve the security boundary: public writes are controlled, full logs are private, and status checks require exact unpredictable request IDs.
- Record failed or inconvenient findings; they are part of the value of the project.

## Active Tasks

- Keep documentation synced with Project Framework.
- Use Test 006 as the current behavior baseline.
- Run additional adversarial or sales-positioning tests only when there is a concrete practical scenario.
