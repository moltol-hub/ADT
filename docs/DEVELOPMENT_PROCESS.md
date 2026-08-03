# ADT Development Process

This document defines how we develop ADT features.

ADT is treated as an experimental system, not as a normal website. A feature is not considered complete just because it appears on the page. It must help test agent discovery, trust, factual extraction, action, logging, or safety.

## Current Baseline

Current deployed project:

- URL: https://adt-roofing-card.tkch-lx.chatgpt.site
- Latest deployed checkpoint: `v0.4-security-gate`
- Hosting/runtime: Sites deployment with Worker/API and D1-style server storage
- GitHub repository: `moltol-hub/ADT`
- GitHub status: Sites `v0.4-security-gate` source baseline is synced into this repository

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
- use the GitHub app/contents API for small UTF-8 documentation writes when normal local credentials are unavailable.

### 2. ADT Site/API External Access

Status: not fully solved for a real external experiment.

Known issue:

- the current Sites deployment exists and has API endpoints, but earlier checks showed the site was still in owner-only or restricted access mode;
- if the page is not reachable by external agents, external discovery and API action logs will not happen;
- the deployed runtime is still Sites, so GitHub source and Sites deployment must be kept in sync after every release.

Current working assumption:

- GitHub is the source of truth for product source and process documentation;
- the deployed Sites project remains the current runtime;
- before a real v0.5 external experiment, verify that the GitHub source matches the deployed Sites checkpoint being tested;
- controlled external access must be enabled only after security smoke tests pass.

## Next Process Step

Prepare `v0.5-controlled-external-access`.

Acceptance criteria:

- deployed source is available in GitHub and matches the intended Sites checkpoint;
- external access mode is decided;
- public page can be reached from outside the owner environment;
- write endpoint accepts only valid controlled actions;
- log reading remains private;
- status check works only with a valid unpredictable `request_id`;
- external smoke test results are recorded in this repo.
