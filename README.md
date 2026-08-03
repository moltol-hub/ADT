# AI Agent Discovery & Trust (ADT)

ADT is an experimental project for testing how AI agents discover a service, decide whether to trust it, extract facts correctly, and perform controlled actions that leave server-side logs.

Current applied niche: roofing and construction services.

## Current Status

- Repository: `moltol-hub/ADT`
- Default branch: `main`
- Current project URL: https://adt-roofing-card.tkch-lx.chatgpt.site
- Latest working baseline: `v0.5-controlled-external-access`
- Latest behavior test: blind agent prompt, Test 002
- GitHub status: `v0.5` source, smoke result, and blind behavior results are recorded.

## What Exists Now

The current Sites project has gone through these stages:

1. `v0.2` - agent action demo on the page and `/agent.json`.
2. `v0.3` - server-side loop: agent action -> API -> event/request log -> status check.
3. `v0.4-security-gate` - security gate before external access.
4. `v0.5-controlled-external-access` - public reachability, external API smoke test, and blind agent behavior test passed with findings.

Security gate behavior:

- public write path for controlled agent actions;
- public status check only by exact unpredictable `request_id`;
- common logs are not publicly exposed;
- input validation and length limits;
- unknown actions rejected;
- payload size limits;
- basic rate limiting;
- `/agent.json` documents API and security rules.

## Repository Shape

- `app/` - page, UI, and agent action API route;
- `public/agent.json` - machine-readable agent metadata;
- `db/` and `drizzle/` - D1 schema and migration;
- `worker/`, `vite.config.ts`, and build scripts - Sites/Worker runtime;
- `public/photos/` - roofing/construction visual assets used by the card;
- `docs/DEVELOPMENT_PROCESS.md` - development process and access notes;
- `docs/AGENT_TESTS.md` - real agent-style behavior test log.

## Development Principle

ADT is not developed as a normal landing page. It is developed as an experimental system.

Every change must answer whether it improves at least one of these stages:

- agent discovery;
- agent trust;
- factual extraction;
- controlled action;
- server-side observability;
- safety before external exposure.

See [docs/DEVELOPMENT_PROCESS.md](docs/DEVELOPMENT_PROCESS.md) for the working process and API access notes.

## v0.5 Results

External smoke test on 2026-08-03:

- public page: `200`;
- `/agent.json`: `200`;
- full log read without `requestId`: `403`;
- invalid action: `400`;
- valid request creation: `201`;
- status check by exact `request_id`: `200`;
- spoofed owner email header still blocked full log read: `403`.

Smoke request id: `ADT-0DD2DB04-F119`.

Recorded behavior tests:

- Test 001: external agent-style request submission; request id `ADT-ACB9A4EE-DF00`.
- Test 002: blind agent prompt; request id `ADT-B1A11D03-0803`.

Main Test 002 finding:

- The blind agent completed a controlled action, but did not discover root `/agent.json` on its own.
- It first checked common discovery paths such as `/.well-known/agent.json`, `/llms.txt`, `/openapi.json`, and `/.well-known/ai-plugin.json`, all of which returned `404`.
- The agent found the API by inspecting a public JavaScript asset instead.
- One broader metadata POST returned `500`; malformed or unexpected payloads should return stable `400` validation errors.

## Next Step

Prepare `v0.6-agent-discovery-aliases`:

- expose `/.well-known/agent.json` as an alias or redirect to `/agent.json`;
- add `/llms.txt` with a short agent-readable service summary and links;
- consider `/openapi.json` or minimal API schema documentation;
- document allowed actions and payload examples;
- replace unexpected JSON/metadata failures with stable `400` responses;
- then rerun the blind agent prompt and compare discovery behavior.
