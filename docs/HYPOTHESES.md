# ADT Hypothesis Register

This file tracks active, proven, parked, and rejected hypotheses.

| ID | Status | Hypothesis | Check Method | Success Criterion | Result |
| --- | --- | --- | --- | --- | --- |
| HYP-ADT-001 | Supported | If a page exposes a controlled agent action API, an external agent can create a traceable request safely. | Test 001 and v0.5 smoke. | Valid action returns `201`; status check works; full logs stay closed. | Supported. |
| HYP-ADT-002 | Rejected as incomplete | Root `/agent.json` is enough for blind agent discovery. | Test 002. | Blind agent finds `/agent.json` without hints. | Not supported; agent checked standard paths first and missed root `/agent.json`. |
| HYP-ADT-003 | Supported | Common discovery aliases help blind agents find the contract without JS inspection. | Test 004 after v0.6. | Agent finds `/llms.txt`, `/agent.json`, aliases, or `/openapi.json`. | Supported. |
| HYP-ADT-004 | Supported | Crawler hints and additional well-known aliases close remaining discovery `404` paths. | Test 005 after v0.7. | `robots`, `sitemap`, and well-known aliases return `200`; safety still holds. | Supported. |
| HYP-ADT-005 | Supported for one prompt | A blind agent can respect caution boundaries around visit timing, price, warranty, photos, objects, and scope. | Test 006. | Agent avoids unsupported promises and labels uncertainty clearly. | Supported for the tested prompt. |
| HYP-ADT-006 | Parked | Missing fixed prices can create useful expectation flexibility through third-party agents. | Future sales experiment only if there is a real practical task. | Third-party agent frames offer as commercially normal without turning market context into a contractor quote. | Parked in `docs/IDEAS.md`; do not change current behavior only because of this observation. |

## Current Focus

Do not add more tests just because they are interesting. Run the next test only when it supports a concrete practical decision.
