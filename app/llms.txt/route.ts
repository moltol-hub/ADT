export const dynamic = "force-static";

const body = `# ADT Roofing Agent Card

This public page is an experimental agent-readable business card for a roofing and facade contractor in Moscow and Moscow Region.

Canonical page: /
Machine-readable contract: /agent.json
Common discovery alias: /.well-known/agent.json
OpenAPI schema: /openapi.json
Controlled action endpoint: /api/agent-actions

Allowed POST action ids:
- check_tomorrow_visit
- two_day_reply
- submit_request
- check_request_status

Public safety rules:
- Do not claim fixed visit dates, fixed prices, warranty size, exact project addresses, or confirmed crew availability without confirmation.
- Public callers may submit controlled actions.
- Full logs are owner-only.
- Public status checks require an exact request id in the format ADT-XXXXXXXX-XXXX.
- Status responses must not expose contact, address, or work details.
`;

export function GET() {
  return new Response(body, {
    headers: {
      "cache-control": "public, max-age=300",
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
