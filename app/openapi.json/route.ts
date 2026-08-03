export const dynamic = "force-static";

const schema = {
  openapi: "3.1.0",
  info: {
    title: "ADT Roofing Agent Actions API",
    version: "0.7-search-and-crawl-hints",
    description:
      "Controlled action API for the ADT roofing agent-card experiment.",
  },
  paths: {
    "/api/agent-actions": {
      get: {
        summary: "Check one request status or owner-only event log",
        parameters: [
          {
            name: "requestId",
            in: "query",
            required: false,
            schema: {
              type: "string",
              pattern: "^ADT-[A-F0-9]{8}-[A-F0-9]{4}$",
            },
            description:
              "Exact request id for public safe status checks. Omit only for owner-only full log reads.",
          },
        ],
        responses: {
          "200": {
            description:
              "Safe request status for public callers, or owner-only log for authenticated owner.",
          },
          "403": {
            description:
              "Full event log is closed to public callers without requestId.",
          },
          "404": {
            description: "Request id was not found.",
          },
        },
      },
      post: {
        summary: "Create a controlled agent action event",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["action"],
                properties: {
                  action: {
                    type: "string",
                    enum: [
                      "check_tomorrow_visit",
                      "two_day_reply",
                      "submit_request",
                      "check_request_status",
                    ],
                  },
                  requestId: {
                    type: "string",
                    pattern: "^ADT-[A-F0-9]{8}-[A-F0-9]{4}$",
                  },
                  contact: {
                    type: "string",
                    maxLength: 500,
                  },
                  objectAddress: {
                    type: "string",
                    maxLength: 500,
                  },
                  workSummary: {
                    type: "string",
                    maxLength: 500,
                  },
                  metadata: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      surface: { type: "string", maxLength: 500 },
                      label: { type: "string", maxLength: 500 },
                      clientTs: { type: "string", maxLength: 500 },
                      testMode: { type: "boolean" },
                    },
                  },
                },
              },
              examples: {
                submitRequest: {
                  value: {
                    action: "submit_request",
                    contact: "TEST_AGENT_NO_REAL_PHONE",
                    objectAddress: "Тестовый объект: Москва/МО",
                    workSummary:
                      "Тестовая заявка от агента без реальных персональных данных.",
                    metadata: {
                      surface: "blind_agent_test",
                      label: "submit_request",
                      clientTs: "2026-08-03",
                      testMode: true,
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description:
              "Action accepted and logged with a generated or supplied request id.",
          },
          "400": {
            description:
              "Invalid JSON, action id, request id, metadata, or field shape.",
          },
          "413": {
            description: "Payload is too large.",
          },
          "429": {
            description: "Rate limit exceeded.",
          },
        },
      },
    },
  },
} as const;

export function GET() {
  return Response.json(schema, {
    headers: {
      "cache-control": "public, max-age=300",
    },
  });
}
