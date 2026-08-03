# ADT Development Process

This document defines how we develop ADT features.

ADT is treated as an experimental system, not as a normal website. A feature is not considered complete just because it appears on the page. It must help test agent discovery, trust, factual extraction, action, logging, or safety.

## Current Baseline

Current project:

- URL: https://adt-roofing-card.tkch-lx.chatgpt.site
- Latest working baseline: `v0.5-controlled-external-access`
- Hosting/runtime: Sites deployment with Worker/API and D1-style server storage
- GitHub repository: `moltol-hub/ADT`
- GitHub status: `v0.5-controlled-external-access` source and smoke result are synced

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

Status: being validated in `v0.5-controlled-external-access`.

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
- external smoke results are recorded here.

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
- smoke results are recorded before the next real agent experiment.

Result on 2026-08-03:

- public page returned `200`;
- `/agent.json` returned `200`;
- `GET /api/agent-actions` without `requestId` returned `403`;
- invalid `POST /api/agent-actions` returned `400`;
- valid `POST /api/agent-actions` returned `201`;
- created smoke request id: `ADT-0DD2DB04-F119`;
- `GET /api/agent-actions?requestId=ADT-0DD2DB04-F119` returned `200`;
- spoofed `oai-authenticated-user-email: tkch.lx@gmail.com` header still returned `403` for full log read.

Decision:

- keep `v0.5-controlled-external-access`;
- proceed to real agent behavior tests;
- keep full event log owner-only;
- do not add new product features before reviewing actual agent behavior.

## Next Process Step

After `v0.5` passes:

1. Run real agent prompts.
2. Record behavior in this repository.
3. Decide whether to keep, improve, rollback, or move weak hypotheses to dead hypotheses.
