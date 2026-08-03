# ADT Releases

| Version | Date | What Changed | Verification | Decision |
| --- | --- | --- | --- | --- |
| `v0.2` | 2026-08-03 | Agent action demo on the page and `/agent.json`. | Local/source iteration. | Kept as early baseline. |
| `v0.3` | 2026-08-03 | Server-side loop: action API, event/request log, status check. | Local/source iteration. | Kept as transaction baseline. |
| `v0.4-security-gate` | 2026-08-03 | Security gate before external access. | Safety review and smoke plan. | Kept. |
| `v0.5-controlled-external-access` | 2026-08-03 | Public reachability for controlled tests. | Test 001 and Test 002. | Kept; discovery gap found. |
| `v0.6-agent-discovery-aliases` | 2026-08-03 | Discovery aliases and stable validation errors. | Test 003 and Test 004. | Kept; blind discovery improved. |
| `v0.7-search-and-crawl-hints` | 2026-08-03 | Robots, sitemap, extra well-known aliases. | Test 005 and Test 006. | Current baseline. |

## Current Baseline

`v0.7-search-and-crawl-hints` is the current working baseline. Test 006 is the current behavior baseline.
