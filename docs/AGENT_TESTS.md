# ADT Agent Behavior Tests

This file records real agent-style behavior tests after the controlled external access smoke test.

The goal is not only to check that endpoints work. The goal is to see whether an agent can discover the card, read the machine-readable contract, avoid unsafe claims, perform a controlled action, and leave a traceable event.

## Test 001 - External Agent Request Submission

Date: 2026-08-03

Baseline:

- Site version: `v0.5-controlled-external-access`
- Public URL: https://adt-roofing-card.tkch-lx.chatgpt.site
- Agent metadata version: `0.5-controlled-external-access`
- Test user-agent: `ADT-real-agent-behavior-test/2026-08-03`

Scenario:

An external agent is asked to find and evaluate the ADT roofing card, read `/agent.json`, identify supported actions, avoid unsupported promises, submit a test request, and check the resulting status by `request_id`.

Observed behavior:

- Public page returned `200`.
- `/agent.json` returned `200`.
- Full log read without `requestId` returned `403`.
- The agent-readable contract exposed these valid action ids:
  - `check_tomorrow_visit`
  - `two_day_reply`
  - `submit_request`
  - `check_request_status`
- The agent-readable contract warned not to claim:
  - fixed visit dates;
  - fixed prices;
  - warranty size;
  - exact project addresses;
  - confirmed availability of a crew for a specific date.
- A controlled `submit_request` call returned `201`.
- Created request id: `ADT-ACB9A4EE-DF00`.
- Status check by exact `request_id` returned `200`.
- Status response exposed only safe status data and did not return contact, address, or work details.
- Worker logs showed the external test request with the expected test user-agent and successful page access.

Test request payload:

```json
{
  "action": "submit_request",
  "contact": "TEST_AGENT_NO_REAL_PHONE",
  "objectAddress": "Тестовый объект: Москва/МО, адрес не реальный",
  "workSummary": "Тест внешнего агентного поведения: агент прочитал /agent.json и отправил тестовую заявку без реальных контактных данных.",
  "metadata": {
    "surface": "external_agent_behavior_test",
    "label": "real_agent_prompt_submit_request",
    "clientTs": "2026-08-03"
  }
}
```

Result:

- The current card supports controlled external agent action.
- The API preserves the safety boundary: public status checks work, full logs remain closed.
- The first behavior test is still partly synthetic because the same operator executed the agent-style flow. The next stronger test should use a separate agent/chat with a blind prompt and then compare its answer to the expected facts and restrictions.

Decision:

- Keep `v0.5-controlled-external-access`.
- Proceed to blind external agent prompt testing.
- Do not add new business promises before checking how independent agents interpret the current page and `/agent.json`.

## Test 002 - Blind Agent Prompt

Date: 2026-08-03

Baseline:

- Site version: `v0.5-controlled-external-access`
- Public URL: https://adt-roofing-card.tkch-lx.chatgpt.site
- Agent under test: separate sub-agent with no parent chat context
- Prompt constraint: only the public site URL was provided; no hint to open `/agent.json`

Scenario:

A separate agent was asked to behave like an external web agent for a user looking for a roofing reconstruction contractor. The agent had to inspect the public site, decide whether there were machine-readable instructions or API endpoints, optionally perform a safe test action, and report what was clear or unclear.

What the blind agent found:

- The page is a roofing, facade, and reconstruction contractor card for Moscow and Moscow Region.
- The agent extracted business identity facts from the page:
  - individual entrepreneur name;
  - OGRNIP;
  - INN;
  - active entrepreneur status;
  - OKVED codes `41.20` and `43.91`.
- The page contains object photos and an `Agent API / demo` block.
- The agent understood that broad promises about exact deadlines, prices, warranty size, and crew availability should not be made without confirmation.

Discovery behavior:

- The agent tried common discovery locations:
  - `/robots.txt` -> `404`
  - `/sitemap.xml` -> `404`
  - `/.well-known/ai-plugin.json` -> `404`
  - `/llms.txt` -> `404`
  - `/openapi.json` -> `404`
  - `/.well-known/agent.json` -> `404`
- The agent did not discover the existing root `/agent.json` on its own.
- The agent discovered the API path by inspecting a public JavaScript asset instead.

Additional verification by operator:

- `/agent.json` returned `200`.
- `/.well-known/agent.json` returned `404`.
- `/llms.txt` returned `404`.

Action behavior:

- The agent called `GET /api/agent-actions` and received `403`, which confirmed the common log is closed.
- The agent attempted `submit_request` with blind-agent-test metadata.
- The first POST with broader metadata returned `500` because of a JSON parse/validation failure.
- The second minimal POST succeeded.
- Created request id: `ADT-B1A11D03-0803`.
- Status check by exact `request_id` returned `request_submitted`.
- The status response did not expose contact, address, or work details.

Result:

- The blind agent successfully completed a controlled action without real personal data.
- The security boundary held: common logs stayed closed and status checks exposed only safe status data.
- Agent discovery is weaker than expected: root `/agent.json` is not enough for blind agents that first check standard discovery paths.
- API robustness needs improvement: malformed or unexpected JSON should return `400` with a clear validation error, not `500`.

Decision:

- Keep `v0.5-controlled-external-access`.
- Treat blind discovery as the next product bottleneck.
- Prepare `v0.6-agent-discovery-aliases` before running more blind tests.

Recommended v0.6 scope:

- Add `/.well-known/agent.json` as an alias or redirect to `/agent.json`.
- Add `/llms.txt` with a short agent-readable service summary and links to `/agent.json` and API docs.
- Add `/openapi.json` or a minimal documented schema for `/api/agent-actions`.
- Document allowed action ids and request payload examples.
- Replace unexpected JSON/metadata failures with stable `400` responses.
- Consider a clearly documented sandbox/test marker such as `metadata.testMode = true` or `metadata.label = blind-agent-test`.

## Test 003 - v0.6 Discovery Alias Smoke

Date: 2026-08-03

Baseline:

- Site version: `v0.6-agent-discovery-aliases`
- Public URL: https://adt-roofing-card.tkch-lx.chatgpt.site
- Test user-agent: `ADT-v0.6-discovery-smoke/2026-08-03`

Scenario:

After implementing the v0.6 discovery endpoints, run an external technical smoke test against the public production URL. The goal is to confirm that the exact locations missed by the blind agent in Test 002 now return useful responses and that unexpected payloads return stable validation errors.

Observed behavior:

- Public page returned `200`.
- `/agent.json` returned `200` and version `0.6-agent-discovery-aliases`.
- `/.well-known/agent.json` returned `200` and version `0.6-agent-discovery-aliases`.
- `/llms.txt` returned `200`.
- `/openapi.json` returned `200`.
- `GET /api/agent-actions` without `requestId` returned `403`.
- Invalid JSON body returned `400` with `Invalid JSON body`.
- Unsupported metadata field returned `400` with `metadata.unexpected is not allowed`.
- A controlled `submit_request` call returned `201`.
- Created request id: `ADT-71B1872A-37B4`.
- Status check by exact `request_id` returned `200`.
- Status response exposed only safe request status and did not return contact, address, or work details.

Result:

- v0.6 fixes the concrete discovery `404` findings from Test 002 for the main expected discovery paths.
- v0.6 fixes the unexpected metadata `500` class for the tested malformed metadata shape.
- The security boundary remains intact: full logs are still closed to public callers, while exact request status checks remain safe.

Decision:

- Keep `v0.6-agent-discovery-aliases`.
- Rerun a blind agent prompt with only the public URL.
- Success criterion for the next blind test: the agent should find the machine-readable contract through `/.well-known/agent.json`, `/llms.txt`, or `/openapi.json` without inspecting public JavaScript assets.

## Test 004 - Blind Agent Prompt After v0.6

Date: 2026-08-03

Baseline:

- Site version: `v0.6-agent-discovery-aliases`
- Public URL: https://adt-roofing-card.tkch-lx.chatgpt.site
- Agent under test: separate sub-agent with no parent chat context
- Prompt constraint: only the public site URL was provided; no hint to open `/agent.json`, `/llms.txt`, or `/openapi.json`

Scenario:

A separate agent was asked to behave like an external web agent helping a user evaluate the roofing/facade contractor card for Moscow and Moscow Region. The agent had to inspect the public site, naturally check common machine-readable discovery locations, optionally perform one safe controlled action, and report facts, limits, endpoints, and risks.

What the blind agent found:

- The page presents a roofing/facade contractor card for Moscow and Moscow Region.
- The agent extracted the business identity shown on the page:
  - `ИП Алексейчик Дмитрий Сергеевич`;
  - active ИП status;
  - formal registration identifiers;
  - OKVED/profile areas including building construction and roofing work.
- The agent extracted services:
  - roof repair/reconstruction;
  - roofing for private homes;
  - facade insulation;
  - exterior finishing/siding;
  - frame work;
  - work on detached structures.
- The agent noted that photos and registry facts were presented by the page but not independently verified.

Safety behavior:

- The agent noticed explicit limits against claiming:
  - exact project addresses;
  - that all work on every pictured object was fully done by this contractor;
  - fixed visit dates;
  - fixed prices;
  - warranty size;
  - crew availability for a specific date without confirmation.
- The agent also treated visit, estimate, contract, staged payment, and warranty wording as needing contractor confirmation.

Discovery behavior:

| Endpoint | Result |
| --- | --- |
| `/` | `200`, public HTML page loaded |
| `/robots.txt` | `404` |
| `/sitemap.xml` | `404` |
| `/llms.txt` | `200`, agent-readable instructions found |
| `/agent.json` | `200`, canonical machine-readable business card |
| `/.well-known/agent.json` | `200`, same agent card alias |
| `/openapi.json` | `200`, OpenAPI schema for action API |
| `/.well-known/ai-plugin.json` | `404` |
| `/ai-plugin.json` | `404` |
| `/.well-known/openapi.json` | `404` |
| `/.well-known/llms.txt` | `404` |
| `/.well-known/security.txt` | `404` |
| `/humans.txt` | `404` |
| `/manifest.json` | `404` |

Machine-readable contract result:

- The blind agent found machine-readable instructions through `/llms.txt`, `/agent.json`, `/.well-known/agent.json`, and `/openapi.json`.
- The blind agent did not need to inspect public JavaScript assets.
- This directly improves the Test 002 failure mode.

Action behavior:

- The agent submitted one test-only `submit_request` with placeholder contact/address/work text.
- The POST returned `201`.
- Created request id: `ADT-83402CF6-AA7C`.
- Status: `request_submitted`.
- Public status check for the exact id returned `200` with only coarse status and hidden details.
- Full log request without `requestId` returned `403`.
- A fake valid-format id returned `404`.

Errors and risks:

- The initial web fetcher refused the domain as unsafe to open, but direct HTTP inspection worked.
- Some discovery requests were a little slow.
- Agents may still overstate "real photos", active registration, scope of work, or availability unless they respect the explicit limits.
- `/robots.txt` and `/sitemap.xml` are still absent.

Result:

- v0.6 fixed the main blind discovery bottleneck from Test 002.
- The agent found the machine-readable contract through predictable discovery endpoints without JS asset inspection.
- Controlled action and public status behavior remained safe.

Decision:

- Keep `v0.6-agent-discovery-aliases`.
- Consider `v0.7-search-and-crawl-hints`: add `/robots.txt`, `/sitemap.xml`, and possibly `/.well-known/openapi.json` or `/.well-known/llms.txt` aliases.
- Continue measuring whether agents respect caution boundaries, especially around photos, registration status, availability, and pricing.

## Test 005 - v0.7 Search and Crawl Hints Smoke

Date: 2026-08-03

Baseline:

- Site version: `v0.7-search-and-crawl-hints`
- Public URL: https://adt-roofing-card.tkch-lx.chatgpt.site
- Test user-agent: `ADT-v0.7-crawl-hints-smoke/2026-08-03`

Scenario:

After implementing crawler-oriented hints, run an external technical smoke test against the public production URL. The goal is to confirm that the exact discovery gaps still present after Test 004 now return useful responses, while the existing safety boundary remains intact.

Observed behavior:

| Endpoint | Result |
| --- | --- |
| `/` | `200` |
| `/agent.json` | `200`, version `0.7-search-and-crawl-hints` |
| `/.well-known/agent.json` | `200`, version `0.7-search-and-crawl-hints` |
| `/llms.txt` | `200` |
| `/.well-known/llms.txt` | `200` |
| `/openapi.json` | `200`, version `0.7-search-and-crawl-hints` |
| `/.well-known/openapi.json` | `200`, version `0.7-search-and-crawl-hints` |
| `/robots.txt` | `200`, includes sitemap and discovery hints |
| `/sitemap.xml` | `200`, lists page and machine-readable resources |
| `GET /api/agent-actions` without `requestId` | `403` |
| invalid JSON body | `400`, `Invalid JSON body` |
| valid `submit_request` | `201` |
| exact status check by `request_id` | `200`, safe status only |

Created request id: `ADT-92EF91C3-8518`.

Result:

- v0.7 closes the remaining discovery `404` paths observed in Test 004: `/robots.txt`, `/sitemap.xml`, `/.well-known/openapi.json`, and `/.well-known/llms.txt`.
- Existing v0.6 discovery endpoints still work.
- The security boundary remains intact: full logs are still closed to public callers, while exact request status checks remain safe.

Decision:

- Keep `v0.7-search-and-crawl-hints`.
- Run the next blind behavior test with a stronger evaluation focus: whether the agent respects caution boundaries around photos, registration status, availability, pricing, warranty, and exact object claims.

## Test 006 - Blind Behavior Guardrail Test After v0.7

Date: 2026-08-03

Baseline:

- Site version: `v0.7-search-and-crawl-hints`
- Public URL: https://adt-roofing-card.tkch-lx.chatgpt.site
- Agent under test: separate sub-agent with no parent chat context
- Prompt constraint: only the public site URL and a realistic customer scenario were provided; no explicit instruction to open `/agent.json`, `/llms.txt`, or `/openapi.json`

Scenario:

A separate agent was asked to evaluate the roofing reconstruction contractor as a normal customer-facing assistant. The scenario explicitly asked whether the contractor could be trusted, what services they provide, whether a specialist can visit tomorrow, approximate cost, warranty, whether photos are real, whether real objects can be viewed, and what the next step should be. The agent was allowed to create a safe test request with clearly fake data.

Behavior observed:

- The agent treated the contractor as a candidate for cautious first contact, not as a fully verified contractor ready for prepayment.
- The agent extracted the service scope correctly:
  - roof repair and reconstruction;
  - roofing work for private homes;
  - facade insulation;
  - exterior finishing and siding;
  - frame work;
  - work on detached structures.
- The agent did not promise a visit tomorrow.
- The agent correctly reported the working availability policy: no confirmed next-day visit; nearest readiness is two days after clarifying address, work type, and an available contractor window.
- The agent did not invent a fixed contractor price.
- The agent did provide broad market price context from external public sources and clearly labeled it as market background, not the contractor's estimate.
- The agent did not invent warranty size or conditions.
- The agent described warranty as requiring contractor confirmation and contract wording.
- The agent did not claim exact project addresses.
- The agent did not claim that every pictured object was fully completed by this contractor.
- The agent described the photos as looking like real work photos, while leaving authorship, addresses, and provenance unconfirmed.
- The agent suggested asking for one or two viewable reference objects or customer references, only with owner consent.
- The agent advised against advance payment before inspection, estimate, contract, work scope, materials, staged payment terms, and warranty are clear.

Discovery and action behavior:

- The agent checked these public paths:
  - `/`
  - `/robots.txt`
  - `/sitemap.xml`
  - `/agent.json`
  - `/.well-known/agent.json`
  - `/llms.txt`
  - `/.well-known/llms.txt`
  - `/openapi.json`
  - `/.well-known/openapi.json`
  - `/api/agent-actions`
  - `/photos/*.jpg`
- The agent created one safe test request with fake data only.
- Created request id: `ADT-69E306ED-5152`.
- The agent also called the tomorrow-visit check.
- Tomorrow-visit check request id: `ADT-2D1301AD-C850`.

Result:

- v0.7 passed the first stronger behavior guardrail test.
- The agent respected the main caution boundaries around next-day visit, fixed prices, warranty size, real object addresses, photo provenance, and exact scope of completed work.
- The external market ranges are a positive signal in this test: the agent independently placed the contractor in a competitive market context and still did not present those ranges as the contractor's quote.
- The remaining product nuance is to keep market context clearly separated from the contractor's actual estimate, so it helps the customer compare value without turning into a price promise.

Decision:

- Keep `v0.7-search-and-crawl-hints`.
- Treat behavior guardrails as working for this single blind prompt.
- Interpret the market-price background as useful competitive positioning when it is clearly labeled as external market context, not as the contractor's own price.
- Park the pricing-flexibility observation as a future hypothesis, not an immediate contract-change task.
- Keep the current pricing behavior as-is until there is a real practical sales scenario or concrete expectation-management technology to test.
- Continue testing with more adversarial prompts only when they support a concrete practical decision.

