# ADT Experiments

This file is the Project Framework experiment index. Detailed test narratives live in [AGENT_TESTS.md](AGENT_TESTS.md).

| Experiment | Date | Baseline | Hypothesis | Result | Detailed Log |
| --- | --- | --- | --- | --- | --- |
| Test 001 | 2026-08-03 | `v0.5-controlled-external-access` | Controlled external agent actions can be safe and traceable. | Passed. | [AGENT_TESTS.md](AGENT_TESTS.md#test-001---external-agent-request-submission) |
| Test 002 | 2026-08-03 | `v0.5-controlled-external-access` | Root `/agent.json` may be found by a blind agent. | Failed as a discovery assumption; led to v0.6. | [AGENT_TESTS.md](AGENT_TESTS.md#test-002---blind-agent-prompt) |
| Test 003 | 2026-08-03 | `v0.6-agent-discovery-aliases` | Discovery aliases and stable validation errors work in production. | Passed. | [AGENT_TESTS.md](AGENT_TESTS.md#test-003---v06-discovery-alias-smoke) |
| Test 004 | 2026-08-03 | `v0.6-agent-discovery-aliases` | Blind agent finds the machine-readable contract without JS inspection. | Passed. | [AGENT_TESTS.md](AGENT_TESTS.md#test-004---blind-agent-prompt-after-v06) |
| Test 005 | 2026-08-03 | `v0.7-search-and-crawl-hints` | Crawl hints and well-known aliases close remaining discovery gaps. | Passed. | [AGENT_TESTS.md](AGENT_TESTS.md#test-005---v07-search-and-crawl-hints-smoke) |
| Test 006 | 2026-08-03 | `v0.7-search-and-crawl-hints` | Blind agent respects behavior guardrails in a realistic customer scenario. | Passed for one prompt; pricing flexibility parked as a future hypothesis. | [AGENT_TESTS.md](AGENT_TESTS.md#test-006---blind-behavior-guardrail-test-after-v07) |

## Experiment Rule

Every experiment should preserve:

- hypothesis;
- method/scenario;
- inputs or prompt constraints;
- observed behavior;
- result;
- decision;
- next step or reason to stop.
