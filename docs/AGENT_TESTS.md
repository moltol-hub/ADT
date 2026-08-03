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
