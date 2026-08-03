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
