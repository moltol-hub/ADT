# ADT Decision Log

Each significant decision gets an ID `DEC-ADT-XXX`.

| ID | Date | Decision | Reason | Consequence | Status |
| --- | --- | --- | --- | --- | --- |
| DEC-ADT-001 | 2026-08-03 | Treat ADT as an experimental agent-discovery and trust system, not a normal landing page. | The project goal is to test external agent behavior, not only human conversion. | Every change must be tied to discovery, trust, extraction, action, logging, or safety. | Active |
| DEC-ADT-002 | 2026-08-03 | Keep public controlled actions, but keep full logs private. | Agents need a transaction path, while public event logs would expose too much. | Public status checks require exact unpredictable request IDs; full log reads stay closed. | Active |
| DEC-ADT-003 | 2026-08-03 | Add common machine-readable discovery paths after blind agents missed root `/agent.json`. | Test 002 showed root-only discovery was insufficient. | v0.6 added `/.well-known/agent.json`, `/llms.txt`, `/openapi.json`, and stable validation errors. | Active |
| DEC-ADT-004 | 2026-08-03 | Add crawler-oriented hints after v0.6 still lacked robots/sitemap/well-known aliases. | Test 004 showed remaining `404` discovery gaps. | v0.7 added `/robots.txt`, `/sitemap.xml`, `/.well-known/llms.txt`, and `/.well-known/openapi.json`. | Active |
| DEC-ADT-005 | 2026-08-03 | Keep current pricing behavior as-is after Test 006. | The blind agent used external market context without treating it as the contractor's quote; this is useful flexibility, not an immediate defect. | Park pricing expectation management as a future hypothesis; do not add stricter price prohibitions yet. | Active |

## Candidate Decisions

| Topic | What Needs Decision | Dependency |
| --- | --- | --- |
| Internet search discovery | Whether to optimize for search-engine discovery beyond direct URL tests. | Needs a real blind web-search scenario. |
| Contractor proof depth | Which proof elements are worth adding: references, real object visits, warranty text, photos, registry checks. | Needs practical sales task or partner confirmation. |
| Sales positioning | Whether to intentionally raise price/quality expectations. | Needs concrete offer, proof, and sales technology to test. |
