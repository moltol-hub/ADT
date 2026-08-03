import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getD1, getDb } from "@/db";
import { agentEvents, agentRequests } from "@/db/schema";

type ActionId =
  | "check_tomorrow_visit"
  | "two_day_reply"
  | "submit_request"
  | "check_request_status";

const LABELS: Record<ActionId, string> = {
  check_tomorrow_visit: "Может ли выехать завтра?",
  two_day_reply: "Ответ через два дня",
  submit_request: "Отправить заявку",
  check_request_status: "Проверить статус обращения",
};

const ADMIN_EMAIL = "tkch.lx@gmail.com";
const MAX_TEXT_LENGTH = 500;
const MAX_METADATA_LENGTH = 1200;
const REQUEST_ID_PATTERN = /^ADT-[A-F0-9]{8}-[A-F0-9]{4}$/;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_EVENTS = 20;

type AgentPayload = {
  action?: unknown;
  requestId?: unknown;
  contact?: unknown;
  objectAddress?: unknown;
  workSummary?: unknown;
  metadata?: unknown;
};

function isActionId(value: unknown): value is ActionId {
  return (
    value === "check_tomorrow_visit" ||
    value === "two_day_reply" ||
    value === "submit_request" ||
    value === "check_request_status"
  );
}

function makeRequestId() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const token = [...bytes]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  return `ADT-${token.slice(0, 8)}-${token.slice(8)}`;
}

function statusForAction(action: ActionId) {
  if (action === "check_tomorrow_visit") {
    return "visit_ready_in_two_days";
  }

  if (action === "submit_request") {
    return "request_submitted";
  }

  if (action === "check_request_status") {
    return "status_checked";
  }

  return "follow_up_ready";
}

function buildResponse(action: ActionId, requestId: string) {
  if (action === "check_tomorrow_visit") {
    return "Завтра выезд не обещаем. Рабочий ответ для агента: ближайшая готовность к выезду — через два дня после уточнения адреса, типа работ и свободного окна исполнителя.";
  }

  if (action === "two_day_reply") {
    return "Через два дня готов продолжить. Следующее действие агента: отправить заявку с адресом объекта, контактным телефоном и кратким описанием работ.";
  }

  if (action === "submit_request") {
    return `Заявка зафиксирована на сервере. Номер обращения: ${requestId}. Следующий шаг: подтверждение исполнителем и уточнение деталей объекта.`;
  }

  return `Статус обращения ${requestId}: обращение найдено, ожидает подтверждения исполнителем.`;
}

function sanitizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const normalized = value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT_LENGTH);

  return normalized || null;
}

function validatePayload(value: unknown): AgentPayload | Response {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return Response.json(
      { error: "JSON body must be an object" },
      { status: 400 },
    );
  }

  return value as AgentPayload;
}

function safeMetadata(value: unknown): string | null | Response {
  if (value === undefined || value === null) return null;

  if (typeof value !== "object" || Array.isArray(value)) {
    return Response.json(
      { error: "metadata must be an object with allowed scalar fields" },
      { status: 400 },
    );
  }

  const input = value as Record<string, unknown>;
  const allowed: Record<string, string> = {};

  for (const [key, fieldValue] of Object.entries(input)) {
    if (!["surface", "label", "clientTs", "testMode"].includes(key)) {
      return Response.json(
        { error: `metadata.${key} is not allowed` },
        { status: 400 },
      );
    }

    if (key === "testMode") {
      if (typeof fieldValue !== "boolean") {
        return Response.json(
          { error: "metadata.testMode must be boolean" },
          { status: 400 },
        );
      }
      allowed[key] = String(fieldValue);
      continue;
    }

    if (typeof fieldValue === "string") {
      const text = sanitizeText(fieldValue);
      if (text) allowed[key] = text;
    } else if (fieldValue !== undefined && fieldValue !== null) {
      return Response.json(
        { error: `metadata.${key} must be a string` },
        { status: 400 },
      );
    }
  }

  for (const key of ["surface", "label", "clientTs"]) {
    if (typeof input[key] === "string") {
      const text = sanitizeText(input[key]);
      if (text) allowed[key] = text;
    }
  }

  const serialized = JSON.stringify(allowed);
  return serialized.length > 2 ? serialized.slice(0, MAX_METADATA_LENGTH) : null;
}

function safeUserAgent(request: Request): string | null {
  return sanitizeText(request.headers.get("user-agent"));
}

function normalizeRequestId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const requestId = value.trim().toUpperCase();
  return REQUEST_ID_PATTERN.test(requestId) ? requestId : null;
}

async function isAdminRequest() {
  const requestHeaders = await headers();
  return requestHeaders.get("oai-authenticated-user-email") === ADMIN_EMAIL;
}

function toRouteErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";

  if (message.includes("no such table") || message.includes("agent_requests")) {
    return "Таблицы журнала пока недоступны. Нужно применить миграцию D1 при деплое.";
  }

  return message;
}

async function ensureAgentTables() {
  const d1 = getD1();

  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS agent_requests (
      request_id text PRIMARY KEY NOT NULL,
      status text DEFAULT 'created' NOT NULL,
      source text DEFAULT 'agent_card' NOT NULL,
      contact text,
      object_address text,
      work_summary text,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    d1.prepare(`CREATE INDEX IF NOT EXISTS agent_requests_status_idx
      ON agent_requests (status)`),
    d1.prepare(`CREATE INDEX IF NOT EXISTS agent_requests_updated_at_idx
      ON agent_requests (updated_at)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS agent_events (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      request_id text NOT NULL,
      action text NOT NULL,
      label text NOT NULL,
      response text NOT NULL,
      metadata text,
      user_agent text,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (request_id) REFERENCES agent_requests(request_id)
    )`),
    d1.prepare(`CREATE INDEX IF NOT EXISTS agent_events_request_id_idx
      ON agent_events (request_id)`),
    d1.prepare(`CREATE INDEX IF NOT EXISTS agent_events_created_at_idx
      ON agent_events (created_at)`),
  ]);
}

async function enforceRateLimit(request: Request) {
  const d1 = getD1();
  const userAgent = safeUserAgent(request) ?? "unknown";
  const result = await d1
    .prepare(
      `SELECT COUNT(*) AS count
       FROM agent_events
       WHERE user_agent = ?
         AND created_at >= datetime('now', '-' || ? || ' seconds')`,
    )
    .bind(userAgent, RATE_LIMIT_WINDOW_SECONDS)
    .first<{ count: number }>();

  if ((result?.count ?? 0) >= RATE_LIMIT_MAX_EVENTS) {
    throw new Response(
      JSON.stringify({
        error: "Слишком много действий за короткий период. Повторите позже.",
      }),
      {
        status: 429,
        headers: { "content-type": "application/json" },
      },
    );
  }
}

export async function GET(request: Request) {
  try {
    await ensureAgentTables();
    const url = new URL(request.url);
    const requestId = normalizeRequestId(url.searchParams.get("requestId"));
    const db = getDb();

    if (requestId) {
      const [agentRequest] = await db
        .select({
          requestId: agentRequests.requestId,
          status: agentRequests.status,
          updatedAt: agentRequests.updatedAt,
        })
        .from(agentRequests)
        .where(eq(agentRequests.requestId, requestId))
        .limit(1);

      if (!agentRequest) {
        return Response.json(
          { error: "Обращение не найдено" },
          { status: 404 },
        );
      }

      return Response.json({
        request: agentRequest,
        response: `Статус обращения ${requestId}: ${agentRequest.status}. Детали обращения скрыты и доступны только владельцу журнала.`,
      });
    }

    if (!(await isAdminRequest())) {
      return Response.json(
        {
          error:
            "Общий журнал закрыт. Для проверки статуса передайте requestId.",
        },
        { status: 403 },
      );
    }

    const [requests, events] = await Promise.all([
      db
        .select({
          requestId: agentRequests.requestId,
          status: agentRequests.status,
          source: agentRequests.source,
          objectAddress: agentRequests.objectAddress,
          workSummary: agentRequests.workSummary,
          createdAt: agentRequests.createdAt,
          updatedAt: agentRequests.updatedAt,
        })
        .from(agentRequests)
        .orderBy(desc(agentRequests.updatedAt))
        .limit(20),
      db
        .select()
        .from(agentEvents)
        .orderBy(desc(agentEvents.createdAt), desc(agentEvents.id))
        .limit(50),
    ]);

    return Response.json({ requests, events });
  } catch (error) {
    return Response.json(
      { error: toRouteErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureAgentTables();
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > 4096) {
      return Response.json({ error: "payload is too large" }, { status: 413 });
    }

    let parsedPayload: unknown;
    try {
      parsedPayload = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const payload = validatePayload(parsedPayload);
    if (payload instanceof Response) return payload;

    if (!isActionId(payload.action)) {
      return Response.json({ error: "action is required" }, { status: 400 });
    }

    await enforceRateLimit(request);

    const requestId = normalizeRequestId(payload.requestId) || makeRequestId();
    const action = payload.action;
    const label = LABELS[action];
    const status = statusForAction(action);
    const response = buildResponse(action, requestId);
    const now = new Date().toISOString();
    const userAgent = safeUserAgent(request);
    const db = getDb();
    const contact = sanitizeText(payload.contact);
    const objectAddress = sanitizeText(payload.objectAddress);
    const workSummary = sanitizeText(payload.workSummary);
    const metadata = safeMetadata(payload.metadata);
    if (metadata instanceof Response) return metadata;

    const existing = await db
      .select({ requestId: agentRequests.requestId })
      .from(agentRequests)
      .where(eq(agentRequests.requestId, requestId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(agentRequests).values({
        requestId,
        status,
        contact,
        objectAddress,
        workSummary,
        updatedAt: now,
      });
    } else {
      await db
        .update(agentRequests)
        .set({
          status,
          contact: contact ?? undefined,
          objectAddress: objectAddress ?? undefined,
          workSummary: workSummary ?? undefined,
          updatedAt: now,
        })
        .where(eq(agentRequests.requestId, requestId));
    }

    const [event] = await db
      .insert(agentEvents)
      .values({
        requestId,
        action,
        label,
        response,
        metadata,
        userAgent,
        createdAt: now,
      })
      .returning();

    return Response.json(
      {
        requestId,
        status,
        response,
        event: {
          id: event.id,
          action: event.action,
          label: event.label,
          requestId: event.requestId,
          response: event.response,
          createdAt: event.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Response) return error;

    return Response.json(
      { error: toRouteErrorMessage(error) },
      { status: 500 },
    );
  }
}
