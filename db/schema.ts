import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const agentRequests = sqliteTable(
  "agent_requests",
  {
    requestId: text("request_id").primaryKey(),
    status: text("status").notNull().default("created"),
    source: text("source").notNull().default("agent_card"),
    contact: text("contact"),
    objectAddress: text("object_address"),
    workSummary: text("work_summary"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("agent_requests_status_idx").on(table.status),
    index("agent_requests_updated_at_idx").on(table.updatedAt),
  ],
);

export const agentEvents = sqliteTable(
  "agent_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    requestId: text("request_id")
      .notNull()
      .references(() => agentRequests.requestId),
    action: text("action").notNull(),
    label: text("label").notNull(),
    response: text("response").notNull(),
    metadata: text("metadata"),
    userAgent: text("user_agent"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("agent_events_request_id_idx").on(table.requestId),
    index("agent_events_created_at_idx").on(table.createdAt),
  ],
);
