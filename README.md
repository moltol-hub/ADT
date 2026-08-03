# AI Agent Discovery & Trust (ADT)

ADT is an experimental project for testing how AI agents discover a service, decide whether to trust it, extract facts correctly, and perform controlled actions that leave server-side logs.

Current applied niche: roofing and construction services.

## Current Status

- Repository: `moltol-hub/ADT`
- Default branch: `main`
- Current public project URL: https://adt-roofing-card.tkch-lx.chatgpt.site
- Latest deployed checkpoint: `v0.4-security-gate`
- Current GitHub status: documentation repository initialized; the deployed Sites source has not yet been exported into this repo.

## What Exists Now

The current Sites deployment has already gone through these stages:

1. `v0.2` - agent action demo on the page and `/agent.json`.
2. `v0.3` - server-side loop: agent action -> API -> event/request log -> status check.
3. `v0.4-security-gate` - security gate before external access.

Security gate changes already made in the deployed Sites project:

- public write path for controlled agent actions;
- public status check only by exact unpredictable `request_id`;
- common logs are not publicly exposed;
- input validation and length limits;
- unknown actions rejected;
- payload size limits;
- basic rate limiting;
- `/agent.json` updated with API and security rules.

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

## Next Step

Before a real external experiment, sync or recreate the Sites source in this repository, then solve controlled external access and run a security smoke test from outside the owner-only environment.
