# ADT Development Process

This document defines how we develop ADT features.

ADT is treated as an experimental system, not as a normal website. A feature is not considered complete just because it appears on the page. It must help test agent discovery, trust, factual extraction, action, logging, or safety.

## Current Baseline

Current project:

- URL: https://adt-roofing-card.tkch-lx.chatgpt.site
- Latest working baseline: `v0.6-agent-discovery-aliases`
- Latest behavior test: blind agent prompt, Test 002
- Hosting/runtime: Sites deployment with Worker/API and D1-style server storage
- GitHub repository: `moltol-hub/ADT`
- GitHub status: `v0.6-agent-discovery-aliases` source and discovery checks are synced

## Standard Change Flow

Every change should follow this order:

1. Hypothesis

   Define what agent behavior the change is expected to improve.

   Example: "If the page exposes a machine-readable `agent.json` and controlled action endpoints, an agent can understand the service and create a traceable request."

2. Change Specification

   Before implementation, write a short specification:

   - why we are making the change;
   - what will change;
   - what will not change;
   - acceptance criteria;
   - expected logs/metrics;
   - safety risks.

3. Minimal Implementation

   Implement only what is needed to test the hypothesis. Avoid adding unrelated UI, copy, or backend complexity.

4. Instrumentation

   A feature is not complete without a server-side trace when action is expected.

   Minimum useful event fields:

   - action type;
   - request id, if a request is created;
   - timestamp;
   - response status;
   - source or channel when available;
   - validation result;
   - error reason when rejected.

5. Security Gate

   Before any external access, run a safety review and smoke test.

   Minimum checks:

   - unknown action is rejected;
   - empty request is rejected or safely handled;
   - very long strings are rejected or truncated;
   - HTML/script input is sanitized;
   - payload size is limited;
   - repeated requests are rate limited;
   - common logs are not publicly readable;
   - status checks require an exact unpredictable `request_id`;
   - no contact/private data is exposed in public responses.

6. External Test

   Run realistic agent prompts from outside the owner-only environment.

   Example prompts:

   - find a roofing contractor in the target geography;
   - check whether the contractor can visit tomorrow;
   - leave a request;
   - check request status;
   - list confirmed facts and uncertain facts.

7. Review Agent Behavior

   Record what happened:

   - did the agent find the page;
   - did it read `/agent.json`;
   - did it extract facts correctly;
   - did it hallucinate unsupported details;
   - did it call or use the intended action path;
   - did the server log the event;
   - could status be checked safely.

8. Decision

   Choose one outcome:

   - keep;
   - improve;
   - rollback;
   - move to dead hypotheses.

## API Access Notes

There are two different API/access topics. Keep them separate.

### 1. GitHub API Access

Status: works through the connected GitHub app.

Verified on 2026-08-03:

- repository `moltol-hub/ADT` is accessible;
- permissions include `pull`, `push`, `maintain`, and `admin`;
- files can be created through the GitHub contents API;
- repository default branch is `main`.

Important limitation:

- normal local `git push` may fail if the local environment has no Git credentials configured;
- when a normal checkout can push, use it for full source sync, especially binary assets;
- use the GitHub app low-level blob/tree/commit/ref flow when normal local credentials are unavailable.

### 2. ADT Site/API External Access

Status: validated in `v0.5-controlled-external-access`, with discovery improvements implemented in `v0.6-agent-discovery-aliases`.

Working model:

- the page may be public for controlled tests;
- write actions may be public only through a strict allowlist of action ids;
- common log reads remain private;
- status reads require exact unpredictable `request_id`;
- payloads, strings, and unknown actions are constrained before storage.

## v0.5 Controlled External Access

Hypothesis:

If the v0.4 security gate is deployed and the site is reachable outside the owner-only environment, an external agent can discover `/agent.json`, call a controlled action, receive a controlled response, and leave a server-side trace without exposing the full event log.

What changes:

- access is opened only for the existing controlled test surface;
- `/agent.json` is marked as `v0.5-controlled-external-access`;
- external smoke and behavior results are recorded.

What does not change:

- no new service promises;
- no public log viewer;
- no contact data exposure;
- no uncontrolled action ids;
- no price, deadline, or warranty claims without confirmation.

Acceptance criteria:

- public page returns successfully;
- `/agent.json` returns successfully;
- `GET /api/agent-actions` without `requestId` returns `403`;
- invalid `POST /api/agent-actions` returns `400`;
- valid `POST /api/agent-actions` returns `201` with a request id;
- `GET /api/agent-actions?requestId=<id>` returns only safe status data;
- smoke and behavior results are recorded before the next iteration.

Smoke result on 2026-08-03:

- public page returned `200`;
- `/agent.json` returned `200`;
- `GET /api/agent-actions` without `requestId` returned `403`;
- invalid `POST /api/agent-actions` returned `400`;
- valid `POST /api/agent-actions` returned `201`;
- created smoke request id: `ADT-0DD2DB04-F119`;
- `GET /api/agent-actions?requestId=ADT-0DD2DB04-F119` returned `200`;
- spoofed `oai-authenticated-user-email: tkch.lx@gmail.com` header still returned `403` for full log read.

Behavior result on 2026-08-03:

- Test 001: controlled action succeeded and safe status check worked.
- Test 002: a separate blind agent completed a controlled action but did not find root `/agent.json` on its own.
- The blind agent checked standard discovery paths first: `/.well-known/agent.json`, `/llms.txt`, `/openapi.json`, `/.well-known/ai-plugin.json`, `/robots.txt`, and `/sitemap.xml`.
- These discovery paths returned `404` in v0.5.
- The blind agent discovered the API only by inspecting a public JavaScript asset.
- One unexpected metadata payload returned `500`; it should become a stable `400` validation response.

Decision:

- keep `v0.5-controlled-external-access`;
- keep full event log owner-only;
- treat blind discovery as the next bottleneck;
- prepare `v0.6-agent-discovery-aliases` before running more blind tests.

## v0.6 Agent Discovery Aliases

Hypothesis:

If ADT exposes common agent discovery endpoints and clearer API schema hints, a blind agent will find the machine-readable contract directly instead of discovering the API by inspecting JavaScript assets.

What changes:

- `/.well-known/agent.json` returns the same contract as `/agent.json`;
- `/llms.txt` summarizes the service, safety limits, and key endpoints;
- `/openapi.json` documents the controlled `/api/agent-actions` schema;
- `/agent.json` is marked as `0.6-agent-discovery-aliases`;
- invalid JSON/body/metadata shapes return stable `400` validation responses.

What does not change:

- no new service promises;
- no public full event log;
- no relaxed request status rules;
- no prices, visit guarantees, warranty promises, or crew availability claims.

Acceptance criteria:

- `/.well-known/agent.json` returns `200`;
- `/llms.txt` returns `200`;
- `/openapi.json` returns `200`;
- `/agent.json` lists discovery aliases;
- invalid JSON/metadata payloads return stable `400` errors, not `500`;
- a new blind agent test finds the contract without inspecting JavaScript assets;
- the new test result is recorded in `docs/AGENT_TESTS.md`.

Local verification:

- `npm test` passed;
- `npm run lint` passed with only existing `<img>` warnings;
- `dist/client/.well-known/agent.json` is present in the built artifact.

Production smoke result on 2026-08-03:

- public page returned `200`;
- `/agent.json` returned `200`;
- `/.well-known/agent.json` returned `200`;
- `/llms.txt` returned `200`;
- `/openapi.json` returned `200`;
- `GET /api/agent-actions` without `requestId` returned `403`;
- invalid JSON returned `400`;
- unsupported metadata returned `400`;
- valid `submit_request` returned `201`;
- created smoke request id: `ADT-71B1872A-37B4`;
- status check by exact request id returned `200` without contact, address, or work details.

Decision:

- deploy `v0.6-agent-discovery-aliases`;
- run a new blind agent prompt after deployment;
- compare discovery behavior against Test 002.

## Next Process Step

After `v0.6` deploys:

1. Run a new blind agent prompt with only the public URL.
2. Check whether the agent finds `/.well-known/agent.json`, `/llms.txt`, or `/openapi.json`.
3. Ask it to perform a safe controlled action.
4. Record behavior in this repository.
5. Decide whether discovery aliases solved the bottleneck.

Current agent behavior log:

- `docs/AGENT_TESTS.md`
